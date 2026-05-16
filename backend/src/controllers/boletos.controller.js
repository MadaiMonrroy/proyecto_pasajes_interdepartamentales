const db = require('../config/db');
const generarComprobantePDF = require('../utils/generarComprobantePDF');
const { enviarCorreo } = require('../services/email.service');
function generarCodigoBoleto(id) {
  return `BOL-${String(id).padStart(6, '0')}`;
}

async function buscarViajesDisponibles(req, res) {
  try {
    const { origen, destino, fecha } = req.query;

    const [viajes] = await db.query(`
      SELECT 
        v.id,
        v.codigo_ruta,
        v.origen,
        v.destino,
        v.fecha_hora_salida,
        v.fecha_hora_llegada,
        v.precio,
        v.estado,
        b.placa,
        b.modelo,
        b.capacidad,
        b.tipo_bus,
        (
          SELECT COUNT(*) 
          FROM boletos bo 
          WHERE bo.id_viaje = v.id 
          AND bo.estado != 'Cancelado'
        ) AS asientos_ocupados
      FROM viajes v
      INNER JOIN buses b ON b.id = v.id_bus
      WHERE v.origen = ?
        AND v.destino = ?
        AND DATE(v.fecha_hora_salida) = ?
        AND v.estado = 'Disponible'
      ORDER BY v.fecha_hora_salida ASC
    `, [origen, destino, fecha]);

    res.json(viajes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar viajes' });
  }
}

async function asientosOcupados(req, res) {
  try {
    const { id_viaje } = req.params;

    const [asientos] = await db.query(`
      SELECT numero_asiento
      FROM boletos
      WHERE id_viaje = ?
      AND estado != 'Cancelado'
    `, [id_viaje]);

    res.json(asientos.map(a => a.numero_asiento));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar asientos' });
  }
}

async function comprarBoleto(req, res) {
  const connection = await db.getConnection();
  let transaccionActiva = false;

  try {
    await connection.beginTransaction();
    transaccionActiva = true;

    const {
      id_viaje,
      metodo_pago,
      correo_comprobante,
      pasajeros
    } = req.body;

    const id_cliente = req.usuario.id;

    if (!Array.isArray(pasajeros) || pasajeros.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Debe enviar al menos un pasajero' });
    }

    const asientosSolicitados = pasajeros.map(p => Number(p.numero_asiento));
    const cisSolicitados = pasajeros.map(p => String(p.ci_pasajero).trim());

    if (new Set(asientosSolicitados).size !== asientosSolicitados.length) {
      await connection.rollback();
      return res.status(400).json({ error: 'No puede repetir asientos en la misma compra' });
    }

    if (new Set(cisSolicitados).size !== cisSolicitados.length) {
      await connection.rollback();
      return res.status(400).json({
        error: 'No se puede registrar más de un pasaje con el mismo CI en la misma compra.'
      });
    }

    const [viajes] = await connection.query(`
      SELECT 
        v.*, 
        b.capacidad, 
        b.tipo_bus,
        b.placa
      FROM viajes v
      INNER JOIN buses b ON b.id = v.id_bus
      WHERE v.id = ?
      LIMIT 1
    `, [id_viaje]);

    if (viajes.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }

    const viaje = viajes[0];

    if (viaje.estado !== 'Disponible') {
      await connection.rollback();
      return res.status(400).json({ error: 'El viaje no está disponible' });
    }

    for (const asiento of asientosSolicitados) {
      if (asiento < 1 || asiento > viaje.capacidad) {
        await connection.rollback();
        return res.status(400).json({ error: `Asiento inválido: ${asiento}` });
      }
    }

    const [ocupados] = await connection.query(`
      SELECT numero_asiento
      FROM boletos
      WHERE id_viaje = ?
      AND estado != 'Cancelado'
      AND numero_asiento IN (?)
      FOR UPDATE
    `, [id_viaje, asientosSolicitados]);

    if (ocupados.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        error: `Asientos ocupados: ${ocupados.map(a => a.numero_asiento).join(', ')}`
      });
    }

    const [ciExistente] = await connection.query(`
      SELECT ci_pasajero
      FROM boletos
      WHERE id_viaje = ?
      AND estado != 'Cancelado'
      AND ci_pasajero IN (?)
      LIMIT 1
      FOR UPDATE
    `, [id_viaje, cisSolicitados]);

    if (ciExistente.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        error: `El CI ${ciExistente[0].ci_pasajero} ya tiene un boleto activo para este viaje.`
      });
    }

    const boletosCreados = [];
const id_vendedor = req.usuario.rol === 'Cliente' ? null : req.usuario.id;
    for (const pasajero of pasajeros) {
      const [resultado] = await connection.query(`
  INSERT INTO boletos (
    id_viaje,
    id_cliente,
    id_vendedor,
    nombre_pasajero,
    ci_pasajero,
    correo_comprobante,
    numero_asiento,
    metodo_pago,
    monto_pagado,
    es_menor,
    nombre_tutor,
    ci_tutor
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`, [
  id_viaje,
  id_cliente,
  id_vendedor,
  pasajero.nombre_pasajero,
  String(pasajero.ci_pasajero).trim(),
  correo_comprobante || null,
  Number(pasajero.numero_asiento),
  metodo_pago,
  viaje.precio,
  pasajero.es_menor ? 1 : 0,
  pasajero.es_menor ? pasajero.nombre_tutor : null,
  pasajero.es_menor ? pasajero.ci_tutor : null
]);

      const codigo = generarCodigoBoleto(resultado.insertId);

      await connection.query(`
        UPDATE boletos
        SET codigo_boleto = ?
        WHERE id = ?
      `, [codigo, resultado.insertId]);

      boletosCreados.push({
        id_boleto: resultado.insertId,
        codigo_boleto: codigo,
        asiento: Number(pasajero.numero_asiento),
        nombre_pasajero: pasajero.nombre_pasajero,
        ci_pasajero: String(pasajero.ci_pasajero).trim()
      });
    }

    const nombreVendedor =
  req.usuario.rol === 'Cliente'
    ? 'Compra a través del sistema'
    : `${req.usuario.nombre || ''} ${req.usuario.apellidos || ''}`.trim();

const total = Number(viaje.precio) * pasajeros.length;

    const pdfBuffer = await generarComprobantePDF({
      compra: {
  metodo_pago,
  total,
  vendedor: nombreVendedor
},
      viaje,
      pasajeros: boletosCreados.map(b => ({
        nombre_pasajero: b.nombre_pasajero,
        ci_pasajero: b.ci_pasajero,
        numero_asiento: b.asiento,
        codigo_boleto: b.codigo_boleto
      }))
    });
await connection.commit();
transaccionActiva = false;
    let correoEnviado = false;

    if (correo_comprobante) {
      try {
        await enviarCorreo(
  correo_comprobante,
  'Comprobante de compra de pasajes',
  `
    <h2>Compra realizada correctamente</h2>
    <p>Adjuntamos tu comprobante de compra en PDF.</p>
    <p><strong>Total:</strong> Bs. ${total}</p>
  `,
  [
    {
      filename: 'comprobante-pasajes.pdf',
      content: pdfBuffer,
      contentType: 'application/pdf'
    }
  ]
);

        correoEnviado = true;
      } catch (mailError) {
        console.error('Error enviando correo:', mailError);
      }
    }

    res.status(201).json({
      mensaje: 'Compra realizada correctamente',
      boletos: boletosCreados,
      correo_enviado: correoEnviado,
      comprobante_pdf: pdfBuffer.toString('base64')
    });

  } catch (error) {
    if (transaccionActiva) {
  await connection.rollback();
}
    console.error(error);
    res.status(500).json({ error: 'Error al comprar boleto' });
  } finally {
    connection.release();
  }
}

async function misBoletos(req, res) {
  try {
    const id_cliente = req.usuario.id;

    const [boletos] = await db.query(`
      SELECT
        bo.id,
        bo.codigo_boleto,
        bo.nombre_pasajero,
        bo.ci_pasajero,
        bo.numero_asiento,
        bo.metodo_pago,
        bo.monto_pagado,
        bo.estado,
        bo.fecha_compra,
        v.codigo_ruta,
        v.origen,
        v.destino,
        v.fecha_hora_salida,
        v.fecha_hora_llegada,
        b.placa,
        b.tipo_bus
      FROM boletos bo
      INNER JOIN viajes v ON v.id = bo.id_viaje
      INNER JOIN buses b ON b.id = v.id_bus
      WHERE bo.id_cliente = ?
      ORDER BY bo.fecha_compra DESC
    `, [id_cliente]);

    res.json(boletos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar boletos' });
  }
}

async function listarVentasSucursal(req, res) {
  try {
    const sucursal   = req.usuario.sucursal;
    const id_usuario = req.usuario.id;
    const { desde, hasta, estado } = req.query;
 
    const fechaDesde = desde || new Date(new Date().setDate(1)).toISOString().slice(0, 10);
    const fechaHasta = hasta || new Date().toISOString().slice(0, 10);
 
    let whereEstado = '';
    const params      = [sucursal, id_usuario, fechaDesde, fechaHasta];
    const paramsKpis  = [sucursal, id_usuario, fechaDesde, fechaHasta];
 
    if (estado && estado !== 'todos') {
      whereEstado = 'AND bo.estado = ?';
      params.push(estado);
    }
 
    // ── Boletos que puede gestionar este encargado:
    //    - los que él vendió (id_vendedor = encargado)
    //    - los que el cliente compró en línea (id_vendedor IS NULL)
    //    - de su sucursal
    const [ventas] = await db.query(`
      SELECT
        bo.id,
        bo.codigo_boleto,
        bo.nombre_pasajero,
        bo.ci_pasajero,
        bo.numero_asiento,
        bo.metodo_pago,
        bo.monto_pagado,
        bo.monto_devuelto,
        bo.estado,
        bo.fecha_compra,
        bo.es_menor,
        bo.id_vendedor,
        v.codigo_ruta,
        v.origen,
        v.destino,
        v.fecha_hora_salida,
        b.placa,
        b.tipo_bus,
        CASE
          WHEN bo.id_vendedor IS NULL THEN 'En línea'
          ELSE u.nombre
        END AS vendido_por
      FROM boletos bo
      INNER JOIN viajes v  ON v.id  = bo.id_viaje
      INNER JOIN buses  b  ON b.id  = v.id_bus
      LEFT  JOIN usuarios u ON u.id = bo.id_vendedor
      WHERE v.origen = ?
      AND (bo.id_vendedor = ? OR bo.id_vendedor IS NULL)
      AND DATE(bo.fecha_compra) BETWEEN ? AND ?
      ${whereEstado}
      ORDER BY bo.fecha_compra DESC
    `, params);
 
    // ── KPIs solo de sus boletos
    const [kpis] = await db.query(`
      SELECT
        COUNT(bo.id) AS total_boletos,
        SUM(CASE WHEN bo.estado != 'Cancelado' THEN bo.monto_pagado  ELSE 0 END) AS ingresos,
        SUM(CASE WHEN bo.estado  = 'Cancelado' THEN 1                ELSE 0 END) AS cancelados,
        SUM(CASE WHEN bo.estado != 'Cancelado' THEN 1                ELSE 0 END) AS activos,
        SUM(bo.monto_devuelto) AS devoluciones
      FROM boletos bo
      INNER JOIN viajes v ON v.id = bo.id_viaje
      WHERE v.origen = ?
      AND (bo.id_vendedor = ? OR bo.id_vendedor IS NULL)
      AND DATE(bo.fecha_compra) BETWEEN ? AND ?
    `, paramsKpis);
 
    // ── Rutas más vendidas (sus boletos)
    const [rutas] = await db.query(`
      SELECT
        CONCAT(v.origen, ' → ', v.destino) AS ruta,
        COUNT(bo.id)         AS boletos,
        SUM(bo.monto_pagado) AS ingresos
      FROM boletos bo
      INNER JOIN viajes v ON v.id = bo.id_viaje
      WHERE v.origen = ?
      AND (bo.id_vendedor = ? OR bo.id_vendedor IS NULL)
      AND DATE(bo.fecha_compra) BETWEEN ? AND ?
      AND bo.estado != 'Cancelado'
      GROUP BY v.origen, v.destino
      ORDER BY boletos DESC
      LIMIT 5
    `, paramsKpis);
 
    // ── Métodos de pago (sus boletos)
    const [metodos] = await db.query(`
      SELECT
        bo.metodo_pago,
        COUNT(bo.id)         AS cantidad,
        SUM(bo.monto_pagado) AS total
      FROM boletos bo
      INNER JOIN viajes v ON v.id = bo.id_viaje
      WHERE v.origen = ?
      AND (bo.id_vendedor = ? OR bo.id_vendedor IS NULL)
      AND DATE(bo.fecha_compra) BETWEEN ? AND ?
      AND bo.estado != 'Cancelado'
      GROUP BY bo.metodo_pago
    `, paramsKpis);
 
    res.json({
      periodo: { desde: fechaDesde, hasta: fechaHasta },
      kpis:    kpis[0],
      ventas,
      rutas,
      metodos,
    });
 
  } catch (error) {
    console.error('Error al listar ventas sucursal:', error);
    res.status(500).json({ error: 'Error al listar ventas' });
  }
}
async function listarViajesDisponiblesEncargado(req, res) {
  try {
    const [viajes] = await db.query(`
      SELECT 
        v.id,
        v.codigo_ruta,
        v.origen,
        v.destino,
        v.fecha_hora_salida,
        v.fecha_hora_llegada,
        v.precio,
        v.estado,
        b.placa,
        b.modelo,
        b.capacidad,
        b.tipo_bus,
        (
          SELECT COUNT(*) 
          FROM boletos bo 
          WHERE bo.id_viaje = v.id 
          AND bo.estado != 'Cancelado'
        ) AS asientos_ocupados
      FROM viajes v
      INNER JOIN buses b ON b.id = v.id_bus
      WHERE v.estado IN ('Disponible', 'En curso', 'Demorado')
      ORDER BY v.fecha_hora_salida ASC
    `);

    res.json(viajes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar viajes disponibles' });
  }
}

function calcularPenalizacion(fechaSalida, montoOriginal) {
  const ahora          = new Date();
  const salida         = new Date(fechaSalida);
  const horasRestantes = (salida - ahora) / (1000 * 60 * 60);
  const porcentaje     = horasRestantes < 24 ? 0.20 : 0.15;
  const penalizacion   = Number((montoOriginal * porcentaje).toFixed(2));
  const devolucion     = Number((montoOriginal - penalizacion).toFixed(2));
  return { porcentaje, penalizacion, devolucion, horasRestantes };
}
 
function calcularPenalizacion(fechaSalida, montoOriginal) {
  const ahora          = new Date();
  const salida         = new Date(fechaSalida);
  const horasRestantes = (salida - ahora) / (1000 * 60 * 60);
  const porcentaje     = horasRestantes < 24 ? 0.20 : 0.15;
  const penalizacion   = Number((montoOriginal * porcentaje).toFixed(2));
  const devolucion     = Number((montoOriginal - penalizacion).toFixed(2));
  return { porcentaje, penalizacion, devolucion, horasRestantes };
}
 
async function cancelarBoletoEncargado(req, res) {
  const connection = await db.getConnection();
  let transaccionActiva = false;
 
  try {
    await connection.beginTransaction();
    transaccionActiva = true;
 
    const { id }     = req.params;
    const sucursal   = req.usuario.sucursal;
    const id_usuario = req.usuario.id;
 
    const [boletos] = await connection.query(`
      SELECT
        bo.id,
        bo.codigo_boleto,
        bo.estado,
        bo.monto_pagado,
        bo.correo_comprobante,
        bo.nombre_pasajero,
        bo.numero_asiento,
        bo.id_vendedor,
        bo.id_viaje,
        v.fecha_hora_salida,
        v.origen,
        v.destino
      FROM boletos bo
      INNER JOIN viajes v ON v.id = bo.id_viaje
      WHERE bo.id = ?
      AND v.origen = ?
      AND (bo.id_vendedor = ? OR bo.id_vendedor IS NULL)
      LIMIT 1
      FOR UPDATE
    `, [id, sucursal, id_usuario]);
 
    if (boletos.length === 0) {
      await connection.rollback();
      return res.status(403).json({
        error: 'No tienes permiso para cancelar este boleto. Solo puedes cancelar los boletos que tú vendiste o que el cliente compró en línea.'
      });
    }
 
    const boleto = boletos[0];
 
    if (boleto.estado === 'Cancelado') {
      await connection.rollback();
      return res.status(400).json({ error: 'El boleto ya está cancelado' });
    }
 
    if (boleto.estado === 'Abordado') {
      await connection.rollback();
      return res.status(400).json({ error: 'No se puede cancelar un boleto abordado' });
    }
 
    const ahora  = new Date();
    const salida = new Date(boleto.fecha_hora_salida);
 
    if (ahora >= salida) {
      await connection.rollback();
      return res.status(400).json({ error: 'No se puede cancelar: el bus ya salió' });
    }
 
    const { porcentaje, penalizacion, devolucion, horasRestantes } =
      calcularPenalizacion(boleto.fecha_hora_salida, boleto.monto_pagado);
 
    await connection.query(`
      UPDATE boletos
      SET estado          = 'Cancelado',
          monto_devuelto  = ?,
          fecha_operacion = NOW()
      WHERE id = ?
    `, [devolucion, id]);
 
    await connection.commit();
    transaccionActiva = false;
 
    if (boleto.correo_comprobante) {
      try {
        await enviarCorreo(
          boleto.correo_comprobante,
          'Tu boleto fue cancelado',
          `
            <h2>Cancelación de boleto</h2>
            <p>El boleto <strong>${boleto.codigo_boleto}</strong> fue cancelado.</p>
            <p>Ruta: ${boleto.origen} → ${boleto.destino}</p>
            <p>Monto pagado: Bs. ${boleto.monto_pagado}</p>
            <p>Penalización (${porcentaje * 100}%): Bs. ${penalizacion}</p>
            <p><strong>Monto a devolver: Bs. ${devolucion}</strong></p>
          `
        );
      } catch (e) {
        console.error('Error enviando correo:', e);
      }
    }
 
    res.json({
      mensaje:                 'Boleto cancelado correctamente',
      codigo_boleto:           boleto.codigo_boleto,
      monto_pagado:            boleto.monto_pagado,
      porcentaje_penalizacion: porcentaje * 100,
      monto_penalizacion:      penalizacion,
      monto_devolucion:        devolucion,
      horas_restantes:         Math.round(horasRestantes),
    });
 
  } catch (error) {
    if (transaccionActiva) await connection.rollback();
    console.error('Error al cancelar boleto encargado:', error);
    res.status(500).json({ error: 'Error al cancelar boleto' });
  } finally {
    connection.release();
  }
}
async function resumenEncargado(req, res) {
  try {
    const sucursal   = req.usuario.sucursal;
    const id_usuario = req.usuario.id;
 
    // ── KPIs del mes — solo boletos del encargado o comprados en línea
    const [mes] = await db.query(`
      SELECT
        COUNT(bo.id)                                                              AS boletos_mes,
        SUM(CASE WHEN bo.estado != 'Cancelado' THEN bo.monto_pagado  ELSE 0 END) AS ingresos_mes,
        SUM(CASE WHEN bo.estado  = 'Cancelado' THEN 1                ELSE 0 END) AS cancelados_mes,
        SUM(CASE WHEN bo.estado != 'Cancelado' THEN 1                ELSE 0 END) AS activos_mes
      FROM boletos bo
      INNER JOIN viajes v ON v.id = bo.id_viaje
      WHERE v.origen = ?
      AND (bo.id_vendedor = ? OR bo.id_vendedor IS NULL)
      AND MONTH(bo.fecha_compra) = MONTH(CURDATE())
      AND YEAR(bo.fecha_compra)  = YEAR(CURDATE())
    `, [sucursal, id_usuario]);
 
    // ── KPIs de hoy
    const [hoy] = await db.query(`
      SELECT
        COUNT(bo.id)                                                              AS boletos_hoy,
        SUM(CASE WHEN bo.estado != 'Cancelado' THEN bo.monto_pagado  ELSE 0 END) AS ingresos_hoy
      FROM boletos bo
      INNER JOIN viajes v ON v.id = bo.id_viaje
      WHERE v.origen = ?
      AND (bo.id_vendedor = ? OR bo.id_vendedor IS NULL)
      AND DATE(bo.fecha_compra) = CURDATE()
    `, [sucursal, id_usuario]);
 
    // ── Rutas más vendidas por este encargado este mes
    const [rutas] = await db.query(`
      SELECT
        CONCAT(v.origen, ' → ', v.destino) AS ruta,
        COUNT(bo.id)         AS boletos,
        SUM(bo.monto_pagado) AS ingresos
      FROM boletos bo
      INNER JOIN viajes v ON v.id = bo.id_viaje
      WHERE v.origen = ?
      AND (bo.id_vendedor = ? OR bo.id_vendedor IS NULL)
      AND bo.estado != 'Cancelado'
      AND MONTH(bo.fecha_compra) = MONTH(CURDATE())
      AND YEAR(bo.fecha_compra)  = YEAR(CURDATE())
      GROUP BY v.origen, v.destino
      ORDER BY boletos DESC
      LIMIT 5
    `, [sucursal, id_usuario]);
 
    // ── Métodos de pago este mes
    const [metodos] = await db.query(`
      SELECT
        bo.metodo_pago,
        COUNT(bo.id)         AS cantidad,
        SUM(bo.monto_pagado) AS total
      FROM boletos bo
      INNER JOIN viajes v ON v.id = bo.id_viaje
      WHERE v.origen = ?
      AND (bo.id_vendedor = ? OR bo.id_vendedor IS NULL)
      AND bo.estado != 'Cancelado'
      AND MONTH(bo.fecha_compra) = MONTH(CURDATE())
      AND YEAR(bo.fecha_compra)  = YEAR(CURDATE())
      GROUP BY bo.metodo_pago
    `, [sucursal, id_usuario]);
 
    res.json({ mes: mes[0], hoy: hoy[0], rutas, metodos });
 
  } catch (error) {
    console.error('Error en resumen encargado:', error);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
}
module.exports = {
  buscarViajesDisponibles,
  asientosOcupados,
  comprarBoleto,
  misBoletos,
  listarVentasSucursal,
  listarViajesDisponiblesEncargado,
  cancelarBoletoEncargado,
  resumenEncargado
};