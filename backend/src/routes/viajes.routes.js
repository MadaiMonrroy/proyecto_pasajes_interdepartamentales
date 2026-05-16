const express = require('express');
const router = express.Router();

const {
  listarViajes,
  crearViaje,
  actualizarViaje,
  cambiarEstadoViaje,
  eliminarViaje
} = require('../controllers/viajes.controller');

const {
  verificarToken,
  permitirRoles
} = require('../middleware/auth.middleware');

router.get(
  '/',
  verificarToken,
  listarViajes
);

router.post(
  '/',
  verificarToken,
  permitirRoles('Administrador'),
  crearViaje
);

router.put(
  '/:id',
  verificarToken,
  permitirRoles('Administrador'),
  actualizarViaje
);

router.patch(
  '/:id/estado',
  verificarToken,
  permitirRoles('Administrador', 'Encargado'),  // ← agrega Encargado
  cambiarEstadoViaje
);

router.delete(
  '/:id',
  verificarToken,
  permitirRoles('Administrador'),
  eliminarViaje
);

module.exports = router;