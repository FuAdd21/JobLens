import dotenv from 'dotenv';

dotenv.config();

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'GEMINI_API_KEY',
  'TELEGRAM_API_ID',
  'TELEGRAM_API_HASH',
];

const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  // FIXED: fail fast so boot errors name missing configuration instead of surfacing later as undefined credentials.
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

export const env = {
  port: process.env.PORT || 5000,
  databaseUrl: process.env.DATABASE_URL,
  geminiApiKey: process.env.GEMINI_API_KEY,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  isProd: process.env.NODE_ENV === 'production',
  telegramApiId: Number(process.env.TELEGRAM_API_ID),
  telegramApiHash: process.env.TELEGRAM_API_HASH,
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  notifyMinScore: Number(process.env.NOTIFY_MIN_SCORE || 0.65),
};
