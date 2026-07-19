import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import input from 'input';
import dotenv from 'dotenv';

dotenv.config();

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;

const run = async () => {
  if (!apiId || !apiHash) {
    throw new Error('TELEGRAM_API_ID and TELEGRAM_API_HASH are required.');
  }

  const client = new TelegramClient(new StringSession(''), apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => input.text('Phone number: '),
    password: async () => input.text('2FA password (if set): '),
    phoneCode: async () => input.text('Code sent to Telegram: '),
    onError: (err) => console.error(err),
  });

  console.log('\nSave this as TELEGRAM_SESSION in .env:\n');
  console.log(client.session.save());
  await client.disconnect();
};

run().catch((err) => {
  console.error('Failed to generate Telegram session:', err);
  process.exit(1);
});
