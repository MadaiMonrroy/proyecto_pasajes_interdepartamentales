const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '77448360', 
    database: 'bddViajesDepartamentales'
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
    } else {
        console.log('¡Conectado a la base de datos MySQL con éxito!');
    }
});

// Ruta de prueba
app.get('/api/estado', (req, res) => {
    res.json({ mensaje: 'El servidor y la base de datos están listos.' });
});

// 1. RUTA PARA BUSCAR VIAJES
app.get('/api/viajes', (req, res) => {
    const { origen, destino, fecha } = req.query;
    const sql = `
        SELECT v.id, v.origen, v.destino, v.fecha_hora_salida, v.precio, b.placa 
        FROM viajes v
        JOIN buses b ON v.id_bus = b.id
        WHERE v.origen = ? AND v.destino = ? AND DATE(v.fecha_hora_salida) = ? AND v.estado = 'Disponible'
    `;
    db.query(sql, [origen, destino, fecha], (err, resultados) => {
        if (err) return res.status(500).json({ error: 'Error en la base de datos' });
        res.json(resultados);
    });
});

// 2. RUTA PARA EL LOGIN
app.post('/api/login', (req, res) => {
    const { correo, password } = req.body;
    const sql = `SELECT id, nombre, correo, rol, sucursal FROM usuarios WHERE correo = ? AND password = ?`;
    db.query(sql, [correo, password], (err, resultados) => {
        if (err) return res.status(500).json({ error: 'Error en el servidor' });
        if (resultados.length > 0) {
            res.json({ mensaje: 'Login exitoso', usuario: resultados[0] });
        } else {
            res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }
    });
});


//RUTA DE REGISTRO

app.post('/api/registro', (req, res) => {
    const { nombre, ci, correo, password, fecha_nacimiento } = req.body;
    const sql = `INSERT INTO usuarios (nombre, ci, correo, password, fecha_nacimiento, rol) VALUES (?, ?, ?, ?, ?, 'Cliente')`;

    db.query(sql, [nombre, ci, correo, password, fecha_nacimiento], (err, resultado) => {
        if (err) {
            console.error('Error al registrar usuario:', err);
            return res.status(500).json({ error: 'Error al crear la cuenta. El correo ya podría estar en uso.' });
        }
        res.json({ mensaje: 'Usuario registrado con éxito', id: resultado.insertId });
    });
});

// 3. RUTA PARA COMPRAR UN BOLETO
app.post('/api/comprar', (req, res) => {
    const { id_viaje, id_cliente, nombre_pasajero, ci_pasajero, numero_asiento, metodo_pago, monto_pagado, es_menor, nombre_tutor, ci_tutor } = req.body;
    const sql = `
        INSERT INTO boletos (id_viaje, id_cliente, nombre_pasajero, ci_pasajero, numero_asiento, metodo_pago, monto_pagado, es_menor, nombre_tutor, ci_tutor) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [id_viaje, id_cliente, nombre_pasajero, ci_pasajero, numero_asiento, metodo_pago, monto_pagado, es_menor, nombre_tutor, ci_tutor], (err, resultado) => {
        if (err) return res.status(500).json({ error: 'Error al procesar la compra' });
        res.json({ mensaje: '¡Boleto comprado con éxito!', id_boleto: resultado.insertId });
    });
});

// 4. RUTA PARA VER ASIENTOS OCUPADOS
app.get('/api/asientos-ocupados/:id_viaje', (req, res) => {
    const { id_viaje } = req.params;
    const sql = `SELECT numero_asiento FROM boletos WHERE id_viaje = ? AND estado != 'Cancelado'`;
    db.query(sql, [id_viaje], (err, resultados) => {
        if (err) return res.status(500).json({ error: 'Error al consultar asientos' });
        const ocupados = resultados.map(r => r.numero_asiento);
        res.json(ocupados);
    });
});

// ARRANCAR EL SERVIDOR
app.listen(3000, () => {
    console.log('Servidor Backend corriendo en http://localhost:3000');
});