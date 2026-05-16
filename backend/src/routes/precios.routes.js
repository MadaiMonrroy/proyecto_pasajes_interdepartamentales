const express = require('express');

const router = express.Router();

const {
  actualizarPrecio,
  historialPrecios
} = require('../controllers/precios.controller');

const {
  verificarToken,
  permitirRoles
} = require('../middleware/auth.middleware');

router.put(
  '/:id',
  verificarToken,
  permitirRoles('Encargado', 'Administrador'),
  actualizarPrecio
);

router.get(
  '/historial',
  verificarToken,
  permitirRoles('Administrador', 'Encargado'),
  historialPrecios
);

module.exports = router;