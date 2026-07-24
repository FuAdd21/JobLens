import pg from 'pg';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

// Aiven requires SSL always (dev and prod), and uses a self-signed CA.
export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  // FIXED: database pool errors use the shared logger.
  logger.error('Unexpected DB pool error', err);
});

export const query = (text, params) => pool.query(text, params);
