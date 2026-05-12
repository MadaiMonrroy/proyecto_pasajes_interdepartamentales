const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


// Conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,           // El puerto que me mencionaste
    user: 'root',
    password: '77448360', // ¡Aquí está tu contraseña!
    database: 'sistema_pasajes_simple'
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
    } else {
        console.log('¡Conectado a la base de datos MySQL con éxito!');
    }
});

// Ruta de prueba para verificar que el puente funciona
app.get('/api/estado', (req, res) => {
    res.json({ mensaje: 'El servidor y la base de datos están listos.' });
});

// Arrancar el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor Backend corriendo en http://localhost:3000');
});