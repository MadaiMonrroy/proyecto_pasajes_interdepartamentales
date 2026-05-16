const db = require('../config/db');

async function actualizarPrecio(req, res) {

  try {

    const { id } = req.params;

    const { precio_nuevo } = req.body;

    if (!precio_nuevo) {
      return res.status(400).json({
        error: 'El nuevo precio es obligatorio'
      });
    }

    const [viajes] = await db.query(`
      SELECT *
      FROM viajes
      WHERE id = ?
      LIMIT 1
    `, [id]);

    if (viajes.length === 0) {
      return res.status(404).json({
        error: 'Viaje no encontrado'
      });
    }

    const viaje = viajes[0];

    const precioAnterior = viaje.precio;

    await db.query(`
      UPDATE viajes
      SET precio = ?
      WHERE id = ?
    `, [
      precio_nuevo,
      id
    ]);

    await db.query(`
      INSERT INTO historial_precios
      (
        id_viaje,
        precio_anterior,
        precio_nuevo,
        id_usuario
      )
      VALUES (?, ?, ?, ?)
    `, [
      id,
      precioAnterior,
      precio_nuevo,
      req.usuario.id
    ]);

    res.json({
      mensaje: 'Precio actualizado correctamente'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error al actualizar precio'
    });

  }
}

async function historialPrecios(req, res) {

  try {

    const [historial] = await db.query(`
  SELECT
    hp.*,
    u.nombre,
    v.codigo_ruta,
    v.origen,
    v.destino,
    v.fecha_hora_salida
  FROM historial_precios hp
  INNER JOIN usuarios u
    ON u.id = hp.id_usuario
  INNER JOIN viajes v
    ON v.id = hp.id_viaje
  ORDER BY hp.fecha_cambio DESC
`);

    res.json(historial);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error al listar historial'
    });

  }
}

module.exports = {
  actualizarPrecio,
  historialPrecios
};