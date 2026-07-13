import { pool } from './pool.js';

// Quick connectivity check: `npm run db:ping`
try {
  const [rows] = await pool.query('SELECT VERSION() AS version, NOW() AS now, DATABASE() AS db');
  console.log('OK — connected to MySQL');
  console.table(rows);
  process.exit(0);
} catch (err) {
  console.error('FAILED to connect:', err.code || err.message);
  console.error(err);
  process.exit(1);
}
