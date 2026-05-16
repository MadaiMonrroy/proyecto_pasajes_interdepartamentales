const express = require('express');
const router = express.Router();

const {
  listarUsuarios,
  crearUsuarioPersonal,
  actualizarUsuario,
  deshabilitarUsuario,
  reenviarActivacion,
  habilitarUsuario
} = require('../controllers/usuarios.controller');

const {
  verificarToken,
  permitirRoles
} = require('../middleware/auth.middleware');

router.get(
  '/',
  verificarToken,
  permitirRoles('Administrador'),
  listarUsuarios
);

router.post(
  '/',
  verificarToken,
  permitirRoles('Administrador'),
  crearUsuarioPersonal
);

router.put(
  '/:id',
  verificarToken,
  permitirRoles('Administrador'),
  actualizarUsuario
);

router.patch(
  '/:id/deshabilitar',
  verificarToken,
  permitirRoles('Administrador'),
  deshabilitarUsuario
);

router.patch(
  '/:id/habilitar',
  verificarToken,
  permitirRoles('Administrador'),
  habilitarUsuario
);

router.patch(
  '/:id/reenviar-activacion',
  verificarToken,
  permitirRoles('Administrador'),
  reenviarActivacion
);

module.exports = router;