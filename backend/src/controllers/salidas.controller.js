const db = require('../config/db');

// GET /api/salidas — viajes del día de la sucursal del encargado
async function listarViajesHoy(req, res) {
  try {
    const sucursal = req.usuario.sucursal;

    const [viajes] = await db.query(`
      SELECT
        v.id,
        v.codigo_ruta,
        v.origen,
        v.destino,
        v.fecha_hora_salida,
        v.fecha_hora_llegada,
        v.estado,
        v.precio,
        b.placa,
        b.tipo_bus,
        b.capacidad,
        (
          SELECT COUNT(*)
          FROM boletos bo
          WHERE bo.id_viaje = v.id
          AND bo.estado != 'Cancelado'
        ) AS total_pasajeros,
        (
          SELECT COUNT(*)
          FROM boletos bo
          WHERE bo.id_viaje = v.id
          AND bo.estado = 'Abordado'
        ) AS pasajeros_abordados
      FROM viajes v
      INNER JOIN buses b ON b.id = v.id_bus
      WHERE v.origen = ?
      AND DATE(v.fecha_hora_salida) = CURDATE()
      ORDER BY v.fecha_hora_salida ASC
    `, [sucursal]);

    res.json(viajes);
  } catch (error) {
    console.error('Error al listar viajes de hoy:', error);
    res.status(500).json({ error: 'Error al listar viajes' });
  }
}

// GET /api/salidas/:id_viaje/pasajeros — lista de pasajeros de un viaje
async function listarPasajerosViaje(req, res) {
  try {
    const { id_viaje } = req.params;

    // Verificar que el viaje sea de la sucursal del encargado
    const sucursal = req.usuario.sucursal;

    const [viajes] = await db.query(`
      SELECT v.id, v.origen FROM viajes v WHERE v.id = ? LIMIT 1
    `, [id_viaje]);

    if (viajes.length === 0) {
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }

    if (viajes[0].origen !== sucursal) {
      return res.status(403).json({ error: 'Este viaje no pertenece a tu sucursal' });
    }

    const [pasajeros] = await db.query(`
      SELECT
        bo.id,
        bo.codigo_boleto,
        bo.nombre_pasajero,
        bo.ci_pasajero,
        bo.numero_asiento,
        bo.metodo_pago,
        bo.estado,
        bo.es_menor,
        bo.nombre_tutor,
        bo.monto_pagado
      FROM boletos bo
      WHERE bo.id_viaje = ?
      AND bo.estado != 'Cancelado'
      ORDER BY bo.numero_asiento ASC
    `, [id_viaje]);

    res.json(pasajeros);
  } catch (error) {
    console.error('Error al listar pasajeros:', error);
    res.status(500).json({ error: 'Error al listar pasajeros' });
  }
}

// PATCH /api/salidas/:id_viaje/abordar/:id_boleto — marcar pasajero como abordado
async function marcarAbordado(req, res) {
  try {
    const { id_viaje, id_boleto } = req.params;

    const [boletos] = await db.query(`
      SELECT id, estado FROM boletos
      WHERE id = ? AND id_viaje = ?
      LIMIT 1
    `, [id_boleto, id_viaje]);

    if (boletos.length === 0) {
      return res.status(404).json({ error: 'Boleto no encontrado' });
    }

    if (boletos[0].estado === 'Cancelado') {
      return res.status(400).json({ error: 'Boleto cancelado' });
    }

    await db.query(`
      UPDATE boletos
      SET estado = 'Abordado', fecha_operacion = NOW()
      WHERE id = ?
    `, [id_boleto]);

    res.json({ mensaje: 'Pasajero marcado como abordado' });
  } catch (error) {
    console.error('Error al marcar abordado:', error);
    res.status(500).json({ error: 'Error al marcar abordado' });
  }
}

// PATCH /api/salidas/:id_viaje/registrar-salida — registrar salida + incidencia opcional
async function registrarSalida(req, res) {
  try {
    const { id_viaje } = req.params;
    const { estado, incidencia } = req.body;

    const estadosValidos = ['En curso', 'Demorado', 'Cancelado_Emergencia'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido para salida' });
    }

    await db.query(`
      UPDATE viajes
      SET estado = ?
      WHERE id = ?
    `, [estado, id_viaje]);

    res.json({ mensaje: `Viaje actualizado a "${estado}"`, incidencia: incidencia || null });
  } catch (error) {
    console.error('Error al registrar salida:', error);
    res.status(500).json({ error: 'Error al registrar salida' });
  }
}

module.exports = {
  listarViajesHoy,
  listarPasajerosViaje,
  marcarAbordado,
  registrarSalida,
};