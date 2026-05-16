const express = require('express');
const router  = express.Router();
const { listarViajesHoy, listarPasajerosViaje, marcarAbordado, registrarSalida } = require('../controllers/salidas.controller');
const { verificarToken, permitirRoles } = require('../middleware/auth.middleware');

router.get('/',                               verificarToken, permitirRoles('Encargado'), listarViajesHoy);
router.get('/:id_viaje/pasajeros',            verificarToken, permitirRoles('Encargado'), listarPasajerosViaje);
router.patch('/:id_viaje/abordar/:id_boleto', verificarToken, permitirRoles('Encargado'), marcarAbordado);
router.patch('/:id_viaje/registrar-salida',   verificarToken, permitirRoles('Encargado'), registrarSalida);

module.exports = router;