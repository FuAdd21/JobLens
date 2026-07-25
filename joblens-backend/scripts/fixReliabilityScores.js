// One-off backfill: recalculates reliability_score for existing TELEGRAM sources using
// the corrected formula, so channels discovered before the fix aren't stuck excluded
// from matching/listing. Safe to run multiple times.
import { pool } from '../src/database/pool.js';
import { getTelegramClient } from '../src/modules/jobs/connectors/telegram/telegramClient.js';

const run = async () => {
  const { rows: sources } = await pool.query(
    "SELECT id, identifier, reliability_score FROM job_sources WHERE type = 'TELEGRAM'"
  );

  console.log(`Found ${sources.length} Telegram sources.`);
  const client = await getTelegramClient();

  for (const source of sources) {
    try {
      const entity = await client.getEntity(source.identifier);
      const fullChannel = await client.invoke(
        new (await import('telegram')).Api.channels.GetFullChannel({ channel: entity })
      );
      const participants = fullChannel.fullChat.participantsCount || 0;
      const newScore = Math.min(100, 20 + Math.floor(participants / 100));

      await pool.query('UPDATE job_sources SET reliability_score = $1 WHERE id = $2', [
        newScore,
        source.id,
      ]);
      console.log(`${source.identifier}: ${source.reliability_score} -> ${newScore} (${participants} members)`);
      await new Promise((r) => setTimeout(r, 1500)); // gentle on Telegram's API
    } catch (err) {
      console.error(`Failed for ${source.identifier}:`, err.message);
    }
  }

  await pool.end();
  console.log('Done.');
};

run();