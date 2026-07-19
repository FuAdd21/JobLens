import { getTelegramClient } from './telegramClient.js';

export const collectFromChannel = async (channelUsername, limit = 50) => {
  const client = await getTelegramClient();
  const normalizedChannel = channelUsername.replace(/^@/, '');
  const entity = await client.getEntity(normalizedChannel);
  const messages = await client.getMessages(entity, { limit });

  return messages
    .filter((message) => message.message && message.message.trim().length > 20)
    .map((message) => ({
      rawContent: message.message,
      postedAt: message.date ? new Date(message.date * 1000) : new Date(),
      sourceMessageId: message.id,
      sourceUrl: `https://t.me/${normalizedChannel}/${message.id}`,
    }));
};
