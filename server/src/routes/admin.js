import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { ah } from '../utils/async-handler.js';

export const adminRouter = Router();

// Everything here requires an authenticated admin.
adminRouter.use(requireAuth, requireAdmin);

const USER_FIELDS =
  'id, username, email, role, sexo, edad, pais, ciudad, grado, created_at';

// GET /api/admin/users — list with a games count.
adminRouter.get(
  '/users',
  ah(async (_req, res) => {
    const [rows] = await pool.query(
      `SELECT ${USER_FIELDS.split(', ').map((f) => 'u.' + f).join(', ')},
            COUNT(g.id) AS partidas
       FROM users u
       LEFT JOIN games g ON g.user_id = u.id
       GROUP BY u.id
       ORDER BY u.id`
    );
    res.json({ users: rows });
  })
);

// POST /api/admin/users — create a user.
adminRouter.post(
  '/users',
  ah(async (req, res) => {
    const { username, email, password, role, sexo, edad, pais, ciudad, grado } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email y password son obligatorios' });
    }

    const [dup] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1',
      [username, email]
    );
    if (dup.length) return res.status(409).json({ error: 'El usuario o email ya existe' });

    const hash = await bcrypt.hash(String(password), 10);
    const [result] = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, sexo, edad, pais, ciudad, grado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        username, email, hash,
        role === 'admin' ? 'admin' : 'jugador',
        sexo || null, edad || null, pais || null, ciudad || null, grado || null,
      ]
    );
    const [rows] = await pool.query(`SELECT ${USER_FIELDS} FROM users WHERE id = ?`, [result.insertId]);
    res.status(201).json({ user: rows[0] });
  })
);

// PUT /api/admin/users/:id — edit fields (and optionally reset password).
adminRouter.put(
  '/users/:id',
  ah(async (req, res) => {
    const id = Number(req.params.id);
    const { username, email, password, role, sexo, edad, pais, ciudad, grado } = req.body || {};

    const sets = [];
    const vals = [];
    const add = (col, val) => { sets.push(`${col} = ?`); vals.push(val); };

    if (username !== undefined) add('username', username);
    if (email !== undefined) add('email', email);
    if (role !== undefined) add('role', role === 'admin' ? 'admin' : 'jugador');
    if (sexo !== undefined) add('sexo', sexo || null);
    if (edad !== undefined) add('edad', edad || null);
    if (pais !== undefined) add('pais', pais || null);
    if (ciudad !== undefined) add('ciudad', ciudad || null);
    if (grado !== undefined) add('grado', grado || null);
    if (password) add('password_hash', await bcrypt.hash(String(password), 10));

    if (!sets.length) return res.status(400).json({ error: 'Nada que actualizar' });

    try {
      await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, [...vals, id]);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Usuario o email duplicado' });
      }
      throw err;
    }

    const [rows] = await pool.query(`SELECT ${USER_FIELDS} FROM users WHERE id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ user: rows[0] });
  })
);

// PUT /api/admin/users/:id/role — quick make-admin / remove-admin.
adminRouter.put(
  '/users/:id/role',
  ah(async (req, res) => {
    const id = Number(req.params.id);
    const role = req.body?.role === 'admin' ? 'admin' : 'jugador';

    // Don't allow removing the last admin.
    if (role === 'jugador') {
      const [[{ admins }]] = await pool.query(
        `SELECT COUNT(*) AS admins FROM users WHERE role = 'admin'`
      );
      const [[target]] = await pool.query('SELECT role FROM users WHERE id = ?', [id]);
      if (target?.role === 'admin' && admins <= 1) {
        return res.status(400).json({ error: 'No puedes quitar al único administrador' });
      }
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    const [rows] = await pool.query(`SELECT ${USER_FIELDS} FROM users WHERE id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ user: rows[0] });
  })
);

// DELETE /api/admin/users/:id
adminRouter.delete(
  '/users/:id',
  ah(async (req, res) => {
    const id = Number(req.params.id);
    if (id === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }
    const [[{ admins }]] = await pool.query(`SELECT COUNT(*) AS admins FROM users WHERE role = 'admin'`);
    const [[target]] = await pool.query('SELECT role FROM users WHERE id = ?', [id]);
    if (target?.role === 'admin' && admins <= 1) {
      return res.status(400).json({ error: 'No puedes eliminar al único administrador' });
    }
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ ok: true });
  })
);

// GET /api/admin/stats — headline numbers for the "Resumen" tab.
adminRouter.get(
  '/stats',
  ah(async (_req, res) => {
    const [[totals]] = await pool.query(
      `SELECT
       (SELECT COUNT(*) FROM users)                       AS total_usuarios,
       (SELECT COUNT(*) FROM users WHERE role='admin')     AS total_admins,
       (SELECT COUNT(*) FROM games)                        AS total_partidas,
       (SELECT ROUND(AVG(score)) FROM games)               AS punt_media_global,
       (SELECT MAX(score) FROM games)                      AS mejor_punt_global`
    );

    // Games per world for a small breakdown chart.
    const [byWorld] = await pool.query(
      `SELECT world_index, COUNT(*) AS partidas, ROUND(AVG(score)) AS punt_media
       FROM games WHERE world_index IS NOT NULL
       GROUP BY world_index ORDER BY world_index`
    );

    // Games in the last 14 days.
    const [byDay] = await pool.query(
      `SELECT DATE(created_at) AS dia, COUNT(*) AS partidas
       FROM games
       WHERE created_at >= (CURRENT_DATE - INTERVAL 13 DAY)
       GROUP BY DATE(created_at) ORDER BY dia`
    );

    res.json({ totals, byWorld, byDay });
  })
);

// GET /api/admin/history — recent games with player name.
adminRouter.get(
  '/history',
  ah(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const [rows] = await pool.query(
      `SELECT g.id, g.created_at, g.level_id, g.level_name, g.world_index,
            g.score, g.stars, g.duration_seconds, g.delivered_orders, g.burned_count,
            u.username, u.id AS user_id
       FROM games g
       JOIN users u ON u.id = g.user_id
       ORDER BY g.created_at DESC
       LIMIT ?`,
      [limit]
    );
    res.json({ history: rows });
  })
);

// GET /api/admin/users/:id/stats — per-player detail for the "Estadísticas" button.
adminRouter.get(
  '/users/:id/stats',
  ah(async (req, res) => {
    const id = Number(req.params.id);
    const [rows] = await pool.query(`SELECT ${USER_FIELDS} FROM users WHERE id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });

    const [[agg]] = await pool.query(
      `SELECT COUNT(*) AS partidas, ROUND(AVG(score)) AS punt_media, MAX(score) AS mejor_punt,
            MIN(NULLIF(duration_seconds,0)) AS mejor_tiempo, MAX(stars) AS mejor_estrellas,
            SUM(delivered_orders) AS pedidos_totales, SUM(burned_count) AS quemados_totales
       FROM games WHERE user_id = ?`,
      [id]
    );
    const [games] = await pool.query(
      `SELECT id, created_at, level_id, level_name, world_index, score, stars,
            duration_seconds, delivered_orders, burned_count
       FROM games WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [id]
    );
    const [progress] = await pool.query(
      `SELECT level_id, best_stars, best_score, best_time_seconds
       FROM level_progress WHERE user_id = ? ORDER BY level_id`,
      [id]
    );

    res.json({ user: rows[0], stats: agg, games, progress });
  })
);
