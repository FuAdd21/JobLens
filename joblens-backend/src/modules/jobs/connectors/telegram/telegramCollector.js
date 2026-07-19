import { getTelegramClient } from "./telegramClient.js";

export const collectFromChannel = async (channelUsername, limit = 50) => {
  console.log("[telegram] connecting...");
  const client = await getTelegramClient();
  console.log("[telegram] connected. resolving entity:", channelUsername);

  const entity = await client.getEntity(channelUsername);
  console.log("[telegram] entity resolved, fetching messages...");

  const messages = await client.getMessages(entity, { limit });
  console.log("[telegram] got", messages.length, "messages");

  return messages
    .filter((message) => message.message && message.message.trim().length > 20)
    .map((message) => ({
      rawContent: message.message,
      postedAt: message.date ? new Date(message.date * 1000) : new Date(),
      sourceMessageId: message.id,
      sourceUrl: `https://t.me/${channelUsername}/${message.id}`,
    }));
};
