const express = require('express');
const router  = express.Router();
const { previewCancelacion, cancelarBoleto } = require('../controllers/cancelaciones.controller');
const { verificarToken, permitirRoles }       = require('../middleware/auth.middleware');

router.get('/:id/preview', verificarToken, permitirRoles('Cliente'), previewCancelacion);
router.post('/:id',        verificarToken, permitirRoles('Cliente'), cancelarBoleto);

module.exports = router;