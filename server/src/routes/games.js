import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { ah } from '../utils/async-handler.js';

export const gamesRouter = Router();

// POST /api/games — submit a finished game (called by the Godot client).
gamesRouter.post('/games', requireAuth, async (req, res) => {
  const {
    level_id,
    level_name = null,
    world_index = null,
    score = 0,
    stars = 0,
    duration_seconds = 0,
    delivered_orders = 0,
    burned_count = 0,
  } = req.body || {};

  if (level_id === undefined || level_id === null) {
    return res.status(400).json({ error: 'level_id es obligatorio' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [ins] = await conn.query(
      `INSERT INTO games
        (user_id, level_id, level_name, world_index, score, stars,
         duration_seconds, delivered_orders, burned_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        level_id,
        level_name,
        world_index,
        clampInt(score),
        clampStars(stars),
        clampInt(duration_seconds),
        clampInt(delivered_orders),
        clampInt(burned_count),
      ]
    );

    // Upsert best result for this level. best_time keeps the LOWEST time.
    await conn.query(
      `INSERT INTO level_progress (user_id, level_id, best_stars, best_score, best_time_seconds)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         best_stars = GREATEST(best_stars, VALUES(best_stars)),
         best_score = GREATEST(best_score, VALUES(best_score)),
         best_time_seconds = LEAST(
           COALESCE(best_time_seconds, VALUES(best_time_seconds)),
           COALESCE(VALUES(best_time_seconds), best_time_seconds)
         )`,
      [
        req.user.id,
        level_id,
        clampStars(stars),
        clampInt(score),
        clampInt(duration_seconds) || null,
      ]
    );

    await conn.commit();
    res.status(201).json({ ok: true, game_id: ins.insertId });
  } catch (err) {
    await conn.rollback();
    console.error('submit game error', err);
    res.status(500).json({ error: 'Error al guardar la partida' });
  } finally {
    conn.release();
  }
});

// GET /api/progress — this user's best result per level (replaces progress.cfg).
gamesRouter.get(
  '/progress',
  requireAuth,
  ah(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT level_id, best_stars, best_score, best_time_seconds
       FROM level_progress WHERE user_id = ? ORDER BY level_id`,
      [req.user.id]
    );
    res.json({ progress: rows });
  })
);

// GET /api/ranking — public leaderboard, aggregated per player.
// Shows players who have at least one game.
gamesRouter.get(
  '/ranking',
  ah(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const [rows] = await pool.query(
      `SELECT
        u.id,
        u.username,
        u.sexo,
        u.edad,
        u.pais,
        u.grado,
        COUNT(g.id)                         AS partidas,
        ROUND(AVG(g.score))                 AS punt_media,
        MAX(g.score)                        AS mejor_punt,
        MIN(NULLIF(g.duration_seconds,0))   AS mejor_tiempo,
        MAX(g.stars)                        AS mejor_estrellas,
        (SELECT COUNT(*) FROM level_progress lp
          WHERE lp.user_id = u.id AND lp.best_stars >= 1) AS niveles_completados
     FROM users u
     JOIN games g ON g.user_id = u.id
     GROUP BY u.id
     ORDER BY punt_media DESC, mejor_punt DESC
     LIMIT ?`,
      [limit]
    );
    res.json({ ranking: rows });
  })
);

function clampInt(v) {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
function clampStars(v) {
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(3, n));
}
