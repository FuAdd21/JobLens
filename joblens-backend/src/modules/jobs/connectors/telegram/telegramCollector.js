import { getTelegramClient } from './telegramClient.js';
import { logger } from '../../../../utils/logger.js';

const MAX_POST_AGE_DAYS = 30;

const getFloodWaitSeconds = (err) => {
  const message = err?.message || '';
  const match = message.match(/FLOOD_WAIT_?(\d+)/i);
  return match ? Number(match[1]) : null;
};

export const collectFromChannel = async (channelUsername, limit = 50) => {
  const client = await getTelegramClient();

  try {
    const entity = await client.getEntity(channelUsername);
    const messages = await client.getMessages(entity, { limit });
    const cutoff = Date.now() - MAX_POST_AGE_DAYS * 24 * 60 * 60 * 1000;

    return messages
      .filter((message) => message.message && message.message.trim().length > 20)
      .filter((message) => {
        const postedAt = message.date ? message.date * 1000 : Date.now();
        return postedAt >= cutoff;
      })
      .map((message) => ({
        rawContent: message.message,
        postedAt: message.date ? new Date(message.date * 1000) : new Date(),
        sourceMessageId: message.id,
        sourceUrl: `https://t.me/${channelUsername}/${message.id}`,
      }));
  } catch (err) {
    const floodWaitSeconds = getFloodWaitSeconds(err);
    if (floodWaitSeconds) {
      // FIXED: Telegram FLOOD_WAIT backs off and skips this source instead of crashing the sync loop.
      logger.warn(`[telegram] flood wait for ${channelUsername}, backing off ${floodWaitSeconds}s`);
      await new Promise((resolve) => setTimeout(resolve, floodWaitSeconds * 1000));
      return [];
    }
    throw err;
  }
};
