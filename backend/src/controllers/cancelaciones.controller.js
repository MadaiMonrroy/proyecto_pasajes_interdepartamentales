const db = require('../config/db');
const { enviarCorreo } = require('../services/email.service');

// Penalización: 20% si faltan menos de 24h, 15% si faltan más de 24h
function calcularPenalizacion(fechaSalida, montoOriginal) {
  const ahora       = new Date();
  const salida      = new Date(fechaSalida);
  const horasRestantes = (salida - ahora) / (1000 * 60 * 60);

  const porcentaje  = horasRestantes < 24 ? 0.20 : 0.15;
  const penalizacion = Number((montoOriginal * porcentaje).toFixed(2));
  const devolucion   = Number((montoOriginal - penalizacion).toFixed(2));

  return { porcentaje, penalizacion, devolucion, horasRestantes };
}

// GET /api/cancelaciones/:id — preview antes de confirmar
async function previewCancelacion(req, res) {
  try {
    const { id } = req.params;
    const id_cliente = req.usuario.id;

    const [boletos] = await db.query(`
      SELECT
        bo.id,
        bo.codigo_boleto,
        bo.estado,
        bo.monto_pagado,
        bo.nombre_pasajero,
        bo.numero_asiento,
        v.fecha_hora_salida,
        v.origen,
        v.destino,
        v.estado AS estado_viaje
      FROM boletos bo
      INNER JOIN viajes v ON v.id = bo.id_viaje
      WHERE bo.id = ?
      AND bo.id_cliente = ?
      LIMIT 1
    `, [id, id_cliente]);

    if (boletos.length === 0) {
      return res.status(404).json({ error: 'Boleto no encontrado' });
    }

    const boleto = boletos[0];

    if (boleto.estado === 'Cancelado') {
      return res.status(400).json({ error: 'Este boleto ya fue cancelado' });
    }

    if (boleto.estado === 'Abordado') {
      return res.status(400).json({ error: 'No se puede cancelar un boleto ya abordado' });
    }

    const ahora  = new Date();
    const salida = new Date(boleto.fecha_hora_salida);

    if (ahora >= salida) {
      return res.status(400).json({ error: 'No se puede cancelar: el bus ya salió o está por salir' });
    }

    const { porcentaje, penalizacion, devolucion, horasRestantes } =
      calcularPenalizacion(boleto.fecha_hora_salida, boleto.monto_pagado);

    res.json({
      boleto: {
        id:              boleto.id,
        codigo_boleto:   boleto.codigo_boleto,
        nombre_pasajero: boleto.nombre_pasajero,
        numero_asiento:  boleto.numero_asiento,
        origen:          boleto.origen,
        destino:         boleto.destino,
        fecha_hora_salida: boleto.fecha_hora_salida,
        monto_pagado:    boleto.monto_pagado,
      },
      cancelacion: {
        horas_restantes:      Math.round(horasRestantes),
        porcentaje_penalizacion: porcentaje * 100,
        monto_penalizacion:   penalizacion,
        monto_devolucion:     devolucion,
      }
    });

  } catch (error) {
    console.error('Error en preview cancelación:', error);
    res.status(500).json({ error: 'Error al calcular cancelación' });
  }
}

// POST /api/cancelaciones/:id — confirmar cancelación
async function cancelarBoleto(req, res) {
  const connection = await db.getConnection();
  let transaccionActiva = false;

  try {
    await connection.beginTransaction();
    transaccionActiva = true;

    const { id } = req.params;
    const id_cliente = req.usuario.id;

    const [boletos] = await connection.query(`
      SELECT
        bo.id,
        bo.codigo_boleto,
        bo.estado,
        bo.monto_pagado,
        bo.correo_comprobante,
        bo.nombre_pasajero,
        bo.numero_asiento,
        bo.id_viaje,
        v.fecha_hora_salida,
        v.origen,
        v.destino,
        v.estado AS estado_viaje
      FROM boletos bo
      INNER JOIN viajes v ON v.id = bo.id_viaje
      WHERE bo.id = ?
      AND bo.id_cliente = ?
      LIMIT 1
      FOR UPDATE
    `, [id, id_cliente]);

    if (boletos.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Boleto no encontrado' });
    }

    const boleto = boletos[0];

    if (boleto.estado === 'Cancelado') {
      await connection.rollback();
      return res.status(400).json({ error: 'Este boleto ya fue cancelado' });
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

    const { penalizacion, devolucion } =
      calcularPenalizacion(boleto.fecha_hora_salida, boleto.monto_pagado);

    // Actualizar boleto
    await connection.query(`
      UPDATE boletos
      SET estado          = 'Cancelado',
          monto_devuelto  = ?,
          fecha_operacion = NOW()
      WHERE id = ?
    `, [devolucion, id]);

    await connection.commit();
    transaccionActiva = false;

    // Enviar correo de confirmación si tiene correo registrado
    if (boleto.correo_comprobante) {
      try {
        await enviarCorreo(
          boleto.correo_comprobante,
          'Cancelación de boleto confirmada',
          `
            <h2>Boleto cancelado</h2>
            <p>Tu boleto <strong>${boleto.codigo_boleto}</strong> ha sido cancelado.</p>
            <p>Ruta: ${boleto.origen} → ${boleto.destino}</p>
            <p>Monto pagado: Bs. ${boleto.monto_pagado}</p>
            <p>Penalización: Bs. ${penalizacion}</p>
            <p><strong>Monto a devolver: Bs. ${devolucion}</strong></p>
            <p>La devolución se procesará en los próximos días hábiles.</p>
          `
        );
      } catch (mailErr) {
        console.error('Error enviando correo cancelación:', mailErr);
      }
    }

    res.json({
      mensaje:          'Boleto cancelado correctamente',
      codigo_boleto:    boleto.codigo_boleto,
      monto_penalizacion: penalizacion,
      monto_devolucion: devolucion,
    });

  } catch (error) {
    if (transaccionActiva) await connection.rollback();
    console.error('Error al cancelar boleto:', error);
    res.status(500).json({ error: 'Error al cancelar boleto' });
  } finally {
    connection.release();
  }
}

module.exports = { previewCancelacion, cancelarBoleto };