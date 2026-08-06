import sql from 'mssql';
import { config } from './config.js';

let pool = null;

export async function getPool() {
  if (pool) return pool;

  pool = await sql.connect({
    server: config.db.server,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
    options: config.db.options,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  });

  return pool;
}

export async function closePool() {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

export { sql };
