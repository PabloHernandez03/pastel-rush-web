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

// Error handler. Cualquier fallo de un handler (p. ej. la BD deja de responder)
// llega aqui y se convierte en un 500: el servidor responde y sigue en pie.
// Sin esto, un parpadeo de red tumbaba todo el proceso.
app.use((err, _req, res, _next) => {
  const isDbDown = ['ENETUNREACH', 'ECONNREFUSED', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST'].includes(err?.code);
  console.error('[API error]', err?.code || '', err?.message || err);
  if (isDbDown) {
    return res.status(503).json({ error: 'Base de datos no disponible, intenta de nuevo' });
  }
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Ultima red de seguridad: nada debe tumbar el proceso en caliente.
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

app.listen(config.port, () => {
  console.log(`Pastel Rush API escuchando en http://localhost:${config.port}`);
});
