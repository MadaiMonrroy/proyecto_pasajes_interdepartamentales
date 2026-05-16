const db = require('../config/db');

// GET /api/reportes/ventas?desde=&hasta=&sucursal=
async function reporteVentas(req, res) {
  try {
    const { desde, hasta, sucursal } = req.query;

    const fechaDesde = desde || new Date(new Date().setDate(1)).toISOString().slice(0, 10);
    const fechaHasta = hasta || new Date().toISOString().slice(0, 10);

    let whereExtra = '';
    const params = [fechaDesde, fechaHasta];

    if (sucursal) {
      whereExtra = 'AND v.origen = ?';
      params.push(sucursal);
    }

    const [ventas] = await db.query(`
      SELECT
        DATE(bo.fecha_compra) AS fecha,
        v.origen              AS sucursal,
        COUNT(bo.id)          AS cantidad_boletos,
        SUM(bo.monto_pagado)  AS ingresos,
        SUM(bo.monto_devuelto) AS devoluciones,
        SUM(bo.monto_pagado) - SUM(bo.monto_devuelto) AS neto
      FROM boletos bo
      INNER JOIN viajes v ON v.id = bo.id_viaje
      WHERE DATE(bo.fecha_compra) BETWEEN ? AND ?
      AND bo.estado != 'Cancelado'
      ${whereExtra}
      GROUP BY DATE(bo.fecha_compra), v.origen
      ORDER BY DATE(bo.fecha_compra) DESC
    `, params);

    // Totales generales
    const [totales] = await db.query(`
      SELECT
        COUNT(bo.id)           AS total_boletos,
        SUM(bo.monto_pagado)   AS total_ingresos,
        SUM(bo.monto_devuelto) AS total_devoluciones,
        SUM(bo.monto_pagado) - SUM(bo.monto_devuelto) AS total_neto
      FROM boletos bo
      INNER JOIN viajes v ON v.id = bo.id_viaje
      WHERE DATE(bo.fecha_compra) BETWEEN ? AND ?
      AND bo.estado != 'Cancelado'
      ${whereExtra}
    `, params);

    res.json({
      periodo:  { desde: fechaDesde, hasta: fechaHasta },
      totales:  totales[0],
      por_dia:  ventas,
    });

  } catch (error) {
    console.error('Error en reporte de ventas:', error);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
}

// GET /api/reportes/rutas — rutas más demandadas
async function reporteRutas(req, res) {
  try {
    const { desde, hasta } = req.query;
    const fechaDesde = desde || new Date(new Date().setDate(1)).toISOString().slice(0, 10);
    const fechaHasta = hasta || new Date().toISOString().slice(0, 10);

    const [rutas] = await db.query(`
      SELECT
        v.origen,
        v.destino,
        CONCAT(v.origen, ' → ', v.destino) AS ruta,
        COUNT(bo.id)         AS total_boletos,
        SUM(bo.monto_pagado) AS ingresos_totales,
        AVG(bo.monto_pagado) AS precio_promedio
      FROM boletos bo
      INNER JOIN viajes v ON v.id = bo.id_viaje
      WHERE DATE(bo.fecha_compra) BETWEEN ? AND ?
      AND bo.estado != 'Cancelado'
      GROUP BY v.origen, v.destino
      ORDER BY total_boletos DESC
      LIMIT 10
    `, [fechaDesde, fechaHasta]);

    res.json({ periodo: { desde: fechaDesde, hasta: fechaHasta }, rutas });
  } catch (error) {
    console.error('Error en reporte de rutas:', error);
    res.status(500).json({ error: 'Error al generar reporte de rutas' });
  }
}

// GET /api/reportes/resumen — KPIs generales para dashboard
async function resumenGeneral(req, res) {
  try {
    const [totalHoy] = await db.query(`
      SELECT
        COUNT(bo.id)         AS boletos_hoy,
        SUM(bo.monto_pagado) AS ingresos_hoy
      FROM boletos bo
      WHERE DATE(bo.fecha_compra) = CURDATE()
      AND bo.estado != 'Cancelado'
    `);

    const [totalMes] = await db.query(`
      SELECT
        COUNT(bo.id)         AS boletos_mes,
        SUM(bo.monto_pagado) AS ingresos_mes
      FROM boletos bo
      WHERE MONTH(bo.fecha_compra) = MONTH(CURDATE())
      AND YEAR(bo.fecha_compra)  = YEAR(CURDATE())
      AND bo.estado != 'Cancelado'
    `);

    const [cancelacionesMes] = await db.query(`
      SELECT COUNT(id) AS total_cancelaciones
      FROM boletos
      WHERE estado = 'Cancelado'
      AND MONTH(fecha_operacion) = MONTH(CURDATE())
      AND YEAR(fecha_operacion)  = YEAR(CURDATE())
    `);

    const [viajesActivos] = await db.query(`
      SELECT COUNT(id) AS viajes_activos
      FROM viajes
      WHERE estado IN ('Disponible', 'En curso')
    `);

    const [porSucursal] = await db.query(`
      SELECT
        v.origen AS sucursal,
        COUNT(bo.id)         AS boletos,
        SUM(bo.monto_pagado) AS ingresos
      FROM boletos bo
      INNER JOIN viajes v ON v.id = bo.id_viaje
      WHERE MONTH(bo.fecha_compra) = MONTH(CURDATE())
      AND YEAR(bo.fecha_compra)  = YEAR(CURDATE())
      AND bo.estado != 'Cancelado'
      GROUP BY v.origen
      ORDER BY ingresos DESC
    `);

    res.json({
      hoy:                  totalHoy[0],
      mes:                  totalMes[0],
      cancelaciones_mes:    cancelacionesMes[0].total_cancelaciones,
      viajes_activos:       viajesActivos[0].viajes_activos,
      por_sucursal:         porSucursal,
    });
  } catch (error) {
    console.error('Error en resumen general:', error);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
}

module.exports = { reporteVentas, reporteRutas, resumenGeneral };