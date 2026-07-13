import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { pool } from './db/pool.js';
import { authRouter } from './routes/auth.js';
import { gamesRouter } from './routes/games.js';
import { adminRouter } from './routes/admin.js';

const app = express();
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Health check.
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'up' });
  } catch {
    res.status(503).json({ ok: false, db: 'down' });
  }
});

app.use('/api/auth', authRouter);
app.use('/api', gamesRouter);
app.use('/api/admin', adminRouter);

// Fallback 404 for unknown API routes.
app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

app.listen(config.port, () => {
  console.log(`Pastel Rush API escuchando en http://localhost:${config.port}`);
});
