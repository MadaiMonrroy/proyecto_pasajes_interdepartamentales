const db = require('../config/db');

async function listarViajes(req, res) {

  try {

    const [viajes] = await db.query(`
      SELECT
        v.*,
        b.placa,
        b.capacidad,
        b.tipo_bus
      FROM viajes v
      INNER JOIN buses b
      ON b.id = v.id_bus
      ORDER BY v.fecha_hora_salida ASC
    `);

    res.json(viajes);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error al listar viajes'
    });

  }
}

async function crearViaje(req, res) {

  try {

    const {
      id_bus,
      codigo_ruta,
      origen,
      destino,
      fecha_hora_salida,
      fecha_hora_llegada,
      precio,
      estado
    } = req.body;

    if (
      !id_bus ||
      !origen ||
      !destino ||
      !fecha_hora_salida ||
      !precio
    ) {
      return res.status(400).json({
        error: 'Faltan datos obligatorios'
      });
    }

    const [bus] = await db.query(`
      SELECT *
      FROM buses
      WHERE id = ?
      LIMIT 1
    `, [id_bus]);

    if (bus.length === 0) {
      return res.status(404).json({
        error: 'Bus no encontrado'
      });
    }

    if (bus[0].estado !== 'Habilitado') {
      return res.status(400).json({
        error: 'El bus no está habilitado'
      });
    }

    const [solapado] = await db.query(`
      SELECT id
      FROM viajes
      WHERE id_bus = ?
      AND estado IN ('Disponible', 'En curso')
      AND (
        (? BETWEEN fecha_hora_salida AND fecha_hora_llegada)
        OR
        (? BETWEEN fecha_hora_salida AND fecha_hora_llegada)
      )
      LIMIT 1
    `, [
      id_bus,
      fecha_hora_salida,
      fecha_hora_llegada
    ]);

    if (solapado.length > 0) {
      return res.status(409).json({
        error: 'El bus ya tiene un viaje asignado en ese horario'
      });
    }

    const [resultado] = await db.query(`
      INSERT INTO viajes
(
  id_bus,
  codigo_ruta,
  origen,
  destino,
  fecha_hora_salida,
  fecha_hora_llegada,
  precio,
  estado
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
  id_bus,
  codigo_ruta,
  origen,
  destino,
  fecha_hora_salida,
  fecha_hora_llegada,
  precio,
  estado || 'Disponible'
]);

    res.status(201).json({
      mensaje: 'Viaje creado correctamente',
      id: resultado.insertId
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error al crear viaje'
    });

  }
}

async function actualizarViaje(req, res) {

  try {

    const { id } = req.params;

    const {
      id_bus,
      codigo_ruta,
      origen,
      destino,
      fecha_hora_salida,
      fecha_hora_llegada,
      precio,
      estado
    } = req.body;

    await db.query(`
      UPDATE viajes
      SET
        id_bus = ?,
        codigo_ruta = ?,
        origen = ?,
        destino = ?,
        fecha_hora_salida = ?,
        fecha_hora_llegada = ?,
        precio = ?,
        estado = ?
      WHERE id = ?
    `, [
      id_bus,
      codigo_ruta,
      origen,
      destino,
      fecha_hora_salida,
      fecha_hora_llegada,
      precio,
      estado,
      id
    ]);

    res.json({
      mensaje: 'Viaje actualizado correctamente'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error al actualizar viaje'
    });

  }
}
async function cambiarEstadoViaje(req, res) {

  try {

    const { id } = req.params;

    const { estado } = req.body;

    await db.query(`
      UPDATE viajes
      SET estado = ?
      WHERE id = ?
    `, [
      estado,
      id
    ]);

    res.json({
      mensaje: 'Estado actualizado'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error al actualizar estado'
    });

  }
}

async function eliminarViaje(req, res) {

  try {

    const { id } = req.params;

    await db.query(`
      DELETE FROM viajes
      WHERE id = ?
    `, [id]);

    res.json({
      mensaje: 'Viaje eliminado'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error al eliminar viaje'
    });

  }
}
module.exports = {
  listarViajes,
  crearViaje,
  actualizarViaje,
  cambiarEstadoViaje,
  eliminarViaje
};