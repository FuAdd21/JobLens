import { getTelegramClient } from "./telegramClient.js";

const MAX_POST_AGE_DAYS = 30; // don't bother ingesting anything older than this

export const collectFromChannel = async (channelUsername, limit = 50) => {
  const client = await getTelegramClient();
  const entity = await client.getEntity(channelUsername);
  const messages = await client.getMessages(entity, { limit });

  const cutoff = Date.now() - MAX_POST_AGE_DAYS * 24 * 60 * 60 * 1000;

  return messages
    .filter((m) => m.message && m.message.trim().length > 20)
    .filter((m) => {
      const postedAt = m.date ? m.date * 1000 : Date.now();
      return postedAt >= cutoff; // hard cutoff — old posts never even get parsed
    })
    .map((m) => ({
      rawContent: m.message,
      postedAt: m.date ? new Date(m.date * 1000) : new Date(),
      sourceMessageId: m.id,
      sourceUrl: `https://t.me/${channelUsername}/${m.id}`,
    }));
};
