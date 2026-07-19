import { Api } from 'telegram';
import { getTelegramClient } from './telegramClient.js';
import { getOrCreateJobSource } from '../../jobs.service.js';

// Search terms tied to job-hunting in general, plus your own field —
// broader net catches channels you'd never have found by guessing usernames.
const SEARCH_TERMS = [
  'jobs ethiopia',
  'vacancy ethiopia',
  'ethiopia hiring',
  'ethiopia careers',
  'ngo jobs ethiopia',
  'internship ethiopia',
];

const MIN_PARTICIPANTS = 500; // filter out dead/tiny channels

export const discoverChannels = async () => {
  const client = await getTelegramClient();
  const discovered = new Map(); // dedupe across search terms by username

  for (const term of SEARCH_TERMS) {
    try {
      const result = await client.invoke(
        new Api.contacts.Search({ q: term, limit: 20 })
      );

      for (const chat of result.chats) {
        // Only interested in public broadcast channels with a username, not private groups
        if (chat.username && chat.broadcast) {
          discovered.set(chat.username, {
            username: chat.username,
            title: chat.title,
            participantsCount: chat.participantsCount || 0,
          });
        }
      }
      await new Promise((r) => setTimeout(r, 2000)); // be gentle, avoid flood limits
    } catch (err) {
      console.error(`[discovery] search failed for "${term}":`, err.message);
    }
  }

  const qualified = [...discovered.values()].filter(
    (c) => c.participantsCount >= MIN_PARTICIPANTS
  );

  let registered = 0;
  for (const channel of qualified) {
    const reliabilityScore = Math.min(100, Math.floor(channel.participantsCount / 1000));
    await getOrCreateJobSource(channel.title, 'TELEGRAM', channel.username);
    // bump reliability score based on audience size
    await updateSourceReliability(channel.username, reliabilityScore);
    registered += 1;
  }

  return { searched: SEARCH_TERMS.length, found: discovered.size, qualified: qualified.length, registered };
};

const updateSourceReliability = async (identifier, score) => {
  const { query } = await import('../../../../database/pool.js');
  await query(
    `UPDATE job_sources SET reliability_score = $1 WHERE type = 'TELEGRAM' AND identifier = $2`,
    [score, identifier]
  );
};