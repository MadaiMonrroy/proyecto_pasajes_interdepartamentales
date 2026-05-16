const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const crypto = require('crypto');
const { enviarCorreo } = require('../services/email.service');
async function login(req, res) {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    const [usuarios] = await db.query(
      `SELECT id, nombre, apellidos, ci, telefono, correo, password, rol, sucursal, estado, debe_cambiar_password
       FROM usuarios
       WHERE correo = ?
       LIMIT 1`,
      [correo]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const usuario = usuarios[0];

    if (usuario.estado && usuario.estado === 'Inactivo') {
      return res.status(403).json({ error: 'Usuario deshabilitado' });
    }
if (usuario.estado !== 'Activo') {
  return res.status(403).json({
    error: 'Tu cuenta aún no está activa. Revisa tu correo.'
  });
}

if (usuario.correo_confirmado === 0) {
  return res.status(403).json({
    error: 'Debes confirmar tu correo antes de iniciar sesión.'
  });
}
    let passwordValida = false;

    if (usuario.password.startsWith('$2a$') || usuario.password.startsWith('$2b$')) {
      passwordValida = await bcrypt.compare(password, usuario.password);
    } else {
      passwordValida = password === usuario.password;
    }

    if (!passwordValida) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol,
        sucursal: usuario.sucursal
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    delete usuario.password;

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

async function registroCliente(req, res) {
  try {
    const { nombre, ci, correo, password, fecha_nacimiento } = req.body;

    const [existe] = await db.query(
      'SELECT id FROM usuarios WHERE correo = ? LIMIT 1',
      [correo]
    );

    if (existe.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const tokenConfirmacion = crypto.randomBytes(32).toString('hex');

    const [resultado] = await db.query(`
      INSERT INTO usuarios 
      (nombre, ci, correo, password, fecha_nacimiento, rol, estado, correo_confirmado, token_confirmacion)
      VALUES (?, ?, ?, ?, ?, 'Cliente', 'Pendiente', 0, ?)
    `, [
      nombre,
      ci,
      correo,
      passwordHash,
      fecha_nacimiento || null,
      tokenConfirmacion
    ]);

    const link = `${process.env.FRONTEND_URL}/confirmar-correo?token=${tokenConfirmacion}`;

    await enviarCorreo(
  correo,
  'Confirma tu cuenta',
  `
    <h2>Bienvenido al Sistema de Pasajes</h2>
    <p>Para activar tu cuenta, confirma tu correo:</p>
    <a href="${link}">Confirmar correo</a>
  `
);

    res.status(201).json({
      mensaje: 'Cuenta creada. Revisa tu correo para confirmarla.',
      id: resultado.insertId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar cliente' });
  }
}

async function cambiarPassword(req, res) {
  try {
    const { password_actual, password_nuevo } = req.body;
    const idUsuario = req.usuario.id;

    if (!password_nuevo) {
      return res.status(400).json({ error: 'La nueva contraseña es obligatoria' });
    }

    const [usuarios] = await db.query(
      'SELECT password FROM usuarios WHERE id = ? LIMIT 1',
      [idUsuario]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = usuarios[0];

    if (password_actual) {
      let passwordValida = false;

      if (usuario.password.startsWith('$2a$') || usuario.password.startsWith('$2b$')) {
        passwordValida = await bcrypt.compare(password_actual, usuario.password);
      } else {
        passwordValida = password_actual === usuario.password;
      }

      if (!passwordValida) {
        return res.status(401).json({ error: 'Contraseña actual incorrecta' });
      }
    }

    const passwordHash = await bcrypt.hash(password_nuevo, 10);

    await db.query(
      `UPDATE usuarios 
       SET password = ?, debe_cambiar_password = 0
       WHERE id = ?`,
      [passwordHash, idUsuario]
    );

    res.json({ mensaje: 'Contraseña actualizada correctamente' });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
}

async function recuperarPassword(req, res) {
  try {
    const { correo } = req.body;

    const [usuarios] = await db.query(
      'SELECT id, correo FROM usuarios WHERE correo = ? LIMIT 1',
      [correo]
    );

    if (usuarios.length > 0) {
      const token = crypto.randomBytes(32).toString('hex');

      await db.query(`
        UPDATE usuarios
        SET token_recuperacion = ?,
            token_recuperacion_expira = DATE_ADD(NOW(), INTERVAL 30 MINUTE)
        WHERE id = ?
      `, [token, usuarios[0].id]);

      const link = `${process.env.FRONTEND_URL}/restablecer-password?token=${token}`;

      await enviarCorreo(
  correo,
  'Recuperar contraseña',
  `
    <h2>Recuperación de contraseña</h2>
    <p>Haz clic en el siguiente enlace para cambiar tu contraseña:</p>
    <a href="${link}">Restablecer contraseña</a>
    <p>Este enlace vence en 30 minutos.</p>
  `
);
    }

    res.json({
      mensaje: 'Si el correo existe, se enviaron instrucciones de recuperación.'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al recuperar contraseña' });
  }
}
async function confirmarCorreo(req, res) {
  try {

    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        error: 'Token no proporcionado'
      });
    }

    const [usuarios] = await db.query(`
      SELECT id, correo_confirmado
      FROM usuarios
      WHERE token_confirmacion = ?
      LIMIT 1
    `, [token]);

    // Si no encuentra token
    if (usuarios.length === 0) {

      // Verificamos si ya fue confirmado anteriormente
      return res.json({
        mensaje: 'Tu correo ya fue confirmado anteriormente'
      });
    }

    const usuario = usuarios[0];

    // Si ya estaba confirmado
    if (usuario.correo_confirmado === 1) {
      return res.json({
        mensaje: 'Tu correo ya estaba confirmado'
      });
    }

    await db.query(`
      UPDATE usuarios
      SET correo_confirmado = 1,
          estado = 'Activo',
          token_confirmacion = NULL
      WHERE id = ?
    `, [usuario.id]);

    res.json({
      mensaje: 'Correo confirmado correctamente'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error al confirmar correo'
    });
  }
}
async function restablecerPassword(req, res) {
  try {
    const { token, password_nuevo } = req.body;

    const [usuarios] = await db.query(`
      SELECT id
      FROM usuarios
      WHERE token_recuperacion = ?
      AND token_recuperacion_expira > NOW()
      LIMIT 1
    `, [token]);

    if (usuarios.length === 0) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const passwordHash = await bcrypt.hash(password_nuevo, 10);

    await db.query(`
      UPDATE usuarios
      SET password = ?,
          token_recuperacion = NULL,
          token_recuperacion_expira = NULL,
          debe_cambiar_password = 0
      WHERE id = ?
    `, [passwordHash, usuarios[0].id]);

    res.json({ mensaje: 'Contraseña restablecida correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al restablecer contraseña' });
  }
}
module.exports = {
  login,
  registroCliente,
  cambiarPassword,
  recuperarPassword,
  confirmarCorreo,
  restablecerPassword
};