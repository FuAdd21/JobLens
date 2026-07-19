import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../database/pool.js';
import { env } from '../../config/env.js';

const SALT_ROUNDS = 12;

export const findUserByEmail = async (email) => {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
};

export const createUser = async (email, password) => {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const { rows } = await query(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, role, status, email_verified, created_at`,
    [email, passwordHash]
  );
  return rows[0];
};

export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

export const generateAccessToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpires,
  });

export const generateRefreshToken = (user) =>
  jwt.sign(
    { sub: user.id, tokenVersion: user.refresh_token_version },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpires }
  );

// FR-007: invalidate all refresh tokens by bumping the version.
export const bumpRefreshTokenVersion = async (userId) => {
  await query(
    'UPDATE users SET refresh_token_version = refresh_token_version + 1, updated_at = now() WHERE id = $1',
    [userId]
  );
};
