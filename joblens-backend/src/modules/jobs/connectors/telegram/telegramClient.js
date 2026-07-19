import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import dotenv from 'dotenv';

dotenv.config();

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;

let client = null;

export const getTelegramClient = async () => {
  const sessionString = process.env.TELEGRAM_SESSION?.trim();

  if (!apiId || !apiHash || !sessionString) {
    throw new Error('Telegram credentials are not configured.');
  }

  if (client?.connected) return client;

  let session;
  try {
    session = new StringSession(sessionString);
  } catch {
    throw new Error('Invalid TELEGRAM_SESSION. Save it in .env as one continuous line with no spaces, comments, or line breaks.');
  }

  client = new TelegramClient(session, apiId, apiHash, { connectionRetries: 5 });
  await client.connect();
  return client;
};
