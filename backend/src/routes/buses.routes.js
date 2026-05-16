const express = require('express');
const router = express.Router();

const {
  listarBuses,
  crearBus,
  actualizarBus,
  cambiarEstadoBus
} = require('../controllers/buses.controller');

const {
  verificarToken,
  permitirRoles
} = require('../middleware/auth.middleware');

router.get(
  '/',
  verificarToken,
  listarBuses
);

router.post(
  '/',
  verificarToken,
  permitirRoles('Administrador'),
  crearBus
);

router.put(
  '/:id',
  verificarToken,
  permitirRoles('Administrador'),
  actualizarBus
);

router.patch(
  '/:id/estado',
  verificarToken,
  permitirRoles('Administrador'),
  cambiarEstadoBus
);

module.exports = router;