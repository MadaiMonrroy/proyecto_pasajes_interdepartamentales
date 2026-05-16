const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const busesRoutes = require('./routes/buses.routes');
const viajesRoutes = require('./routes/viajes.routes');
const preciosRoutes = require('./routes/precios.routes');
const boletosRoutes = require('./routes/boletos.routes');
const cancelacionesRoutes = require('./routes/cancelaciones.routes');
const salidasRoutes = require('./routes/salidas.routes');
const reportesRoutes = require('./routes/reportes.routes');

const app = express();

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

app.get('/api/estado', (req, res) => {
  res.json({ mensaje: 'Servidor funcionando correctamente.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.use('/api/buses', busesRoutes);
app.use('/api/viajes', viajesRoutes);
app.use('/api/precios', preciosRoutes);

app.use('/api/boletos', boletosRoutes);
app.use('/api/cancelaciones', cancelacionesRoutes);
app.use('/api/salidas', salidasRoutes);
app.use('/api/reportes', reportesRoutes);
module.exports = app;