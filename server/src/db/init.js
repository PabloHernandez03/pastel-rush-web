import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { pool } from './pool.js';

// Creates tables from schema.sql and seeds a default admin. `npm run db:init`.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const raw = await readFile(path.join(__dirname, 'schema.sql'), 'utf8');

  // Strip full-line SQL comments, then split into individual statements so
  // mysql2 (one statement per query) is happy.
  const sql = raw
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length);

  for (const stmt of statements) {
    await pool.query(stmt);
  }
  console.log(`Applied ${statements.length} schema statements.`);

  // Seed default admin (admin / admin) if it does not exist yet.
  const [rows] = await pool.query('SELECT id FROM users WHERE username = ? LIMIT 1', ['admin']);
  if (rows.length === 0) {
    const hash = await bcrypt.hash('admin', 10);
    await pool.query(
      `INSERT INTO users (username, email, password_hash, role, pais, ciudad, grado)
       VALUES (?, ?, ?, 'admin', 'Mexico', 'Guadalajara', 'Otro')`,
      ['admin', 'admin@admin.com', hash]
    );
    console.log('Seeded default admin — username: admin  password: admin');
  } else {
    console.log('Admin user already exists, skipping seed.');
  }

  console.log('Database ready.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Init failed:', err);
  process.exit(1);
});
