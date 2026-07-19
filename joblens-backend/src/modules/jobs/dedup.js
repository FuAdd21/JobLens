import crypto from 'crypto';
import { query } from '../../database/pool.js';

export const computeDedupHash = (title, organizationName, location) => {
  const normalized = [title, organizationName, location]
    .filter(Boolean)
    .map((value) => value.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .join('|');

  return crypto.createHash('sha256').update(normalized).digest('hex');
};

export const findDuplicateJob = async (dedupHash) => {
  const { rows } = await query('SELECT id FROM jobs WHERE dedup_hash = $1 LIMIT 1', [dedupHash]);
  return rows[0] || null;
};
