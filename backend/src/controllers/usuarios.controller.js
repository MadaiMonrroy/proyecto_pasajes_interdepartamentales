const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../config/db');
const { enviarCorreo } = require('../services/email.service');

// ─────────────────────────────────────────────────────────
async function listarUsuarios(req, res) {
  try {
    const [usuarios] = await db.query(
      `SELECT id, nombre, apellidos, ci, telefono, correo, rol, sucursal,
              estado, debe_cambiar_password, fecha_creacion
       FROM usuarios
       ORDER BY id DESC`
    );
    res.json(usuarios);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
}

// ─────────────────────────────────────────────────────────
async function crearUsuarioPersonal(req, res) {
  try {
    const { nombre, apellidos, ci, telefono, correo, password, rol, sucursal } = req.body;

    if (!nombre || !ci || !correo || !password || !rol) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    if (!['Administrador', 'Encargado'].includes(rol)) {
      return res.status(400).json({ error: 'Solo se puede crear personal administrativo' });
    }

    if (rol === 'Encargado' && !sucursal) {
      return res.status(400).json({ error: 'El encargado debe tener sucursal asignada' });
    }

    const [existe] = await db.query(
      'SELECT id FROM usuarios WHERE correo = ? LIMIT 1',
      [correo]
    );
    if (existe.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    const passwordHash    = await bcrypt.hash(password, 10);
    const tokenActivacion = crypto.randomBytes(32).toString('hex');

    const [resultado] = await db.query(
      `INSERT INTO usuarios
         (nombre, apellidos, ci, telefono, correo, password, rol, sucursal,
          estado, debe_cambiar_password, correo_confirmado, token_confirmacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente', 1, 0, ?)`,
      [
        nombre,
        apellidos || null,
        ci,
        telefono || null,
        correo,
        passwordHash,
        rol,
        rol === 'Encargado' ? sucursal : null,
        tokenActivacion
      ]
    );

    const link = `${process.env.FRONTEND_URL}/confirmar-correo?token=${tokenActivacion}`;

    await enviarCorreo(
  correo,
  'Bienvenido — Activa tu cuenta',
  `
    <h2>Tu cuenta ha sido creada</h2>
    <p>Haz clic para confirmar tu correo y establecer tu contraseña:</p>
    <a href="${link}">Activar cuenta</a>
    <p>Si no solicitaste esto, ignora este mensaje.</p>
  `
);

    res.status(201).json({
      mensaje: 'Usuario creado. Se envió el correo de activación.',
      id: resultado.insertId
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
}

// ─────────────────────────────────────────────────────────
async function actualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { nombre, apellidos, ci, telefono, correo, rol, sucursal, estado } = req.body;

    if (!nombre || !ci || !correo || !rol) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const [duplicado] = await db.query(
      'SELECT id FROM usuarios WHERE correo = ? AND id <> ? LIMIT 1',
      [correo, id]
    );
    if (duplicado.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado por otro usuario' });
    }

    await db.query(
      `UPDATE usuarios
         SET nombre = ?, apellidos = ?, ci = ?, telefono = ?,
             correo = ?, rol = ?, sucursal = ?, estado = ?
       WHERE id = ?`,
      [
        nombre,
        apellidos || null,
        ci,
        telefono || null,
        correo,
        rol,
        rol === 'Encargado' ? sucursal : null,
        estado || 'Activo',
        id
      ]
    );

    res.json({ mensaje: 'Usuario actualizado correctamente' });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
}

// ─────────────────────────────────────────────────────────
async function deshabilitarUsuario(req, res) {
  try {
    await db.query(
      "UPDATE usuarios SET estado = 'Inactivo' WHERE id = ?",
      [req.params.id]
    );
    res.json({ mensaje: 'Usuario deshabilitado correctamente' });
  } catch (error) {
    console.error('Error al deshabilitar usuario:', error);
    res.status(500).json({ error: 'Error al deshabilitar usuario' });
  }
}

// ─────────────────────────────────────────────────────────
async function habilitarUsuario(req, res) {
  try {
    await db.query(
      "UPDATE usuarios SET estado = 'Activo' WHERE id = ?",
      [req.params.id]
    );
    res.json({ mensaje: 'Usuario habilitado correctamente' });
  } catch (error) {
    console.error('Error al habilitar usuario:', error);
    res.status(500).json({ error: 'Error al habilitar usuario' });
  }
}

// ─────────────────────────────────────────────────────────
async function reenviarActivacion(req, res) {
  try {
    const { id } = req.params;

    const [usuarios] = await db.query(
      'SELECT correo, estado FROM usuarios WHERE id = ? LIMIT 1',
      [id]
    );

    if (!usuarios.length) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    if (usuarios[0].estado === 'Activo') {
      return res.status(400).json({ error: 'El usuario ya está activo' });
    }

    const token = crypto.randomBytes(32).toString('hex');

    await db.query(
      'UPDATE usuarios SET token_confirmacion = ? WHERE id = ?',
      [token, id]
    );

    const link = `${process.env.FRONTEND_URL}/confirmar-correo?token=${token}`;

    await enviarCorreo(
  usuarios[0].correo,
  'Activa tu cuenta — ViaGo',
  `
    <h2>Correo de activación</h2>
    <p>Haz clic para activar tu cuenta:</p>
    <a href="${link}">Activar cuenta</a>
  `
);

    res.json({ mensaje: 'Correo de activación reenviado.' });

  } catch (error) {
    console.error('Error al reenviar activación:', error);
    res.status(500).json({ error: 'Error al reenviar activación' });
  }
}

// ─────────────────────────────────────────────────────────
module.exports = {
  listarUsuarios,
  crearUsuarioPersonal,
  actualizarUsuario,
  deshabilitarUsuario,
  habilitarUsuario,
  reenviarActivacion
};