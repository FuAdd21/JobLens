import { Api } from 'telegram';
import { query } from '../../../../database/pool.js';
import { logger } from '../../../../utils/logger.js';
import { getOrCreateJobSource } from '../../jobs.service.js';
import { getTelegramClient } from './telegramClient.js';

const SEARCH_TERMS = [
  'jobs ethiopia',
  'vacancy ethiopia',
  'ethiopia hiring',
  'ethiopia careers',
  'ngo jobs ethiopia',
  'internship ethiopia',
];

const MIN_PARTICIPANTS = 500;

const getFloodWaitSeconds = (err) => {
  const message = err?.message || '';
  const match = message.match(/FLOOD_WAIT_?(\d+)/i);
  return match ? Number(match[1]) : null;
};

const updateSourceReliability = async (identifier, score) => {
  // FIXED: use a top-level database import instead of dynamic imports inside helper code.
  await query(
    "UPDATE job_sources SET reliability_score = $1 WHERE type = 'TELEGRAM' AND identifier = $2",
    [score, identifier],
  );
};

export const discoverChannels = async () => {
  const client = await getTelegramClient();
  const discovered = new Map();

  for (const term of SEARCH_TERMS) {
    try {
      const result = await client.invoke(new Api.contacts.Search({ q: term, limit: 20 }));

      for (const chat of result.chats) {
        if (chat.username && chat.broadcast) {
          discovered.set(chat.username, {
            username: chat.username,
            title: chat.title,
            participantsCount: chat.participantsCount || 0,
          });
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (err) {
      const floodWaitSeconds = getFloodWaitSeconds(err);
      if (floodWaitSeconds) {
        // FIXED: Telegram FLOOD_WAIT backs off and continues discovery instead of failing all terms.
        logger.warn(`[discovery] flood wait for "${term}", backing off ${floodWaitSeconds}s`);
        await new Promise((resolve) => setTimeout(resolve, floodWaitSeconds * 1000));
        continue;
      }
      // FIXED: discovery failures use the shared logger and continue with the next term.
      logger.error(`[discovery] search failed for "${term}":`, err.message);
    }
  }

  const qualified = [...discovered.values()].filter(
    (channel) => channel.participantsCount >= MIN_PARTICIPANTS,
  );

  let registered = 0;
  for (const channel of qualified) {
    const reliabilityScore = Math.min(100, Math.floor(channel.participantsCount / 1000));
    await getOrCreateJobSource(channel.title, 'TELEGRAM', channel.username);
    await updateSourceReliability(channel.username, reliabilityScore);
    registered += 1;
  }

  return { searched: SEARCH_TERMS.length, found: discovered.size, qualified: qualified.length, registered };
};
