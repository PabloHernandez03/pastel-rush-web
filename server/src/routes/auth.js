import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';
import { requireAuth, signToken } from '../middleware/auth.js';

export const authRouter = Router();

// Fields a client is allowed to see about itself / others (never password_hash).
const PUBLIC_USER_FIELDS =
  'id, username, email, role, sexo, edad, pais, ciudad, grado, created_at';

async function findUserByLogin(login) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1',
    [login, login]
  );
  return rows[0] || null;
}

function publicUser(u) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    sexo: u.sexo,
    edad: u.edad,
    pais: u.pais,
    ciudad: u.ciudad,
    grado: u.grado,
    created_at: u.created_at,
  };
}

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
  const { username, email, password, sexo, edad, pais, ciudad, grado } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email y password son obligatorios' });
  }
  if (String(password).length < 4) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
  }

  try {
    const [dup] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1',
      [username, email]
    );
    if (dup.length) {
      return res.status(409).json({ error: 'El usuario o email ya existe' });
    }

    const hash = await bcrypt.hash(String(password), 10);
    const [result] = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, sexo, edad, pais, ciudad, grado)
       VALUES (?, ?, ?, 'jugador', ?, ?, ?, ?, ?)`,
      [username, email, hash, sexo || null, edad || null, pais || null, ciudad || null, grado || null]
    );

    const [rows] = await pool.query(`SELECT ${PUBLIC_USER_FIELDS} FROM users WHERE id = ?`, [
      result.insertId,
    ]);
    const user = rows[0];
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('register error', err);
    res.status(500).json({ error: 'Error al registrar' });
  }
});

// POST /api/auth/login  — accepts { login | username | email, password }
authRouter.post('/login', async (req, res) => {
  const { login, username, email, password } = req.body || {};
  const identifier = login || username || email;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Credenciales incompletas' });
  }
  try {
    const user = await findUserByLogin(identifier);
    if (!user) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req, res) => {
  const [rows] = await pool.query(`SELECT ${PUBLIC_USER_FIELDS} FROM users WHERE id = ?`, [
    req.user.id,
  ]);
  if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json({ user: rows[0] });
});
