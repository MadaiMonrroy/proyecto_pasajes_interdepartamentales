const express = require('express');
const router  = express.Router();
const { reporteVentas, reporteRutas, resumenGeneral } = require('../controllers/reportes.controller');
const { verificarToken, permitirRoles }               = require('../middleware/auth.middleware');

router.get('/ventas',  verificarToken, permitirRoles('Administrador'), reporteVentas);
router.get('/rutas',   verificarToken, permitirRoles('Administrador'), reporteRutas);
router.get('/resumen', verificarToken, permitirRoles('Administrador'), resumenGeneral);

module.exports = router;