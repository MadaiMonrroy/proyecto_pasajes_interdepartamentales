const db = require('../config/db');

async function listarBuses(req, res) {
  try {

    const [buses] = await db.query(`
      SELECT *
      FROM buses
      ORDER BY id DESC
    `);

    res.json(buses);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error al listar buses'
    });

  }
}

async function crearBus(req, res) {

  try {

    const {
      placa,
      modelo,
      capacidad,
      tipo_bus,
      estado
    } = req.body;

    if (!placa || !capacidad) {
      return res.status(400).json({
        error: 'Placa y capacidad son obligatorios'
      });
    }

    const [existe] = await db.query(
      `SELECT id FROM buses WHERE placa = ? LIMIT 1`,
      [placa]
    );

    if (existe.length > 0) {
      return res.status(409).json({
        error: 'La placa ya está registrada'
      });
    }

    const [resultado] = await db.query(`
      INSERT INTO buses
      (
        placa,
        modelo,
        capacidad,
        tipo_bus,
        estado
      )
      VALUES (?, ?, ?, ?, ?)
    `, [
      placa,
      modelo || null,
      capacidad,
      tipo_bus || 'Normal',
      estado || 'Habilitado'
    ]);

    res.status(201).json({
      mensaje: 'Bus creado correctamente',
      id: resultado.insertId
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error al crear bus'
    });

  }
}

async function actualizarBus(req, res) {

  try {

    const { id } = req.params;

    const {
      placa,
      modelo,
      capacidad,
      tipo_bus,
      estado
    } = req.body;

    const [duplicado] = await db.query(
      `SELECT id FROM buses WHERE placa = ? AND id <> ? LIMIT 1`,
      [placa, id]
    );

    if (duplicado.length > 0) {
      return res.status(409).json({
        error: 'La placa ya está registrada'
      });
    }

    await db.query(`
      UPDATE buses
      SET
        placa = ?,
        modelo = ?,
        capacidad = ?,
        tipo_bus = ?,
        estado = ?
      WHERE id = ?
    `, [
      placa,
      modelo,
      capacidad,
      tipo_bus,
      estado,
      id
    ]);

    res.json({
      mensaje: 'Bus actualizado correctamente'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error al actualizar bus'
    });

  }
}
async function cambiarEstadoBus(req, res) {

  try {

    const { id } = req.params;

    const { estado } = req.body;

    if (!['Habilitado', 'Mantenimiento', 'Inactivo'].includes(estado)) {
      return res.status(400).json({
        error: 'Estado inválido'
      });
    }

    await db.query(`
      UPDATE buses
      SET estado = ?
      WHERE id = ?
    `, [
      estado,
      id
    ]);

    res.json({
      mensaje: 'Estado actualizado correctamente'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error al actualizar estado'
    });

  }
}
module.exports = {
  listarBuses,
  crearBus,
  actualizarBus,
  cambiarEstadoBus
};
