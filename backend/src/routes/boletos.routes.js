const express = require('express');
const router = express.Router();

const {
  buscarViajesDisponibles,
  asientosOcupados,
  comprarBoleto,
  misBoletos,
  listarVentasSucursal,
  listarViajesDisponiblesEncargado,
  cancelarBoletoEncargado,
  resumenEncargado,
  descargarBoletoPDF
} = require('../controllers/boletos.controller');

const {
  verificarToken,
  permitirRoles
} = require('../middleware/auth.middleware');

router.get('/buscar', verificarToken, buscarViajesDisponibles);

router.get('/asientos/:id_viaje', verificarToken, asientosOcupados);

router.post('/comprar', verificarToken, permitirRoles('Cliente', 'Encargado', 'Administrador'), comprarBoleto);

router.get('/mis-boletos', verificarToken, permitirRoles('Cliente'), misBoletos);

router.get('/ventas-sucursal', verificarToken, permitirRoles('Encargado', 'Administrador'), listarVentasSucursal);
router.get('/viajes-disponibles', verificarToken, listarViajesDisponiblesEncargado);
router.post('/:id/cancelar-encargado',
  verificarToken,
  permitirRoles('Encargado', 'Administrador'),
  cancelarBoletoEncargado
);
router.get('/resumen-encargado',
  verificarToken,
  permitirRoles('Encargado'),
  resumenEncargado
);
router.get('/:id/pdf', verificarToken, permitirRoles('Cliente'), descargarBoletoPDF);

module.exports = router;