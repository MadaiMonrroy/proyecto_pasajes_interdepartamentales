const express = require('express');
const router = express.Router();

const {
  login,
  registroCliente,
  cambiarPassword,
  recuperarPassword,
  confirmarCorreo,
  restablecerPassword
} = require('../controllers/auth.controller');

const { verificarToken } = require('../middleware/auth.middleware');

router.post('/login', login);
router.post('/registro-cliente', registroCliente);
router.post('/recuperar-password', recuperarPassword);
router.post('/cambiar-password', verificarToken, cambiarPassword);
router.get('/confirmar-correo', confirmarCorreo);
router.post('/restablecer-password', restablecerPassword);
module.exports = router;