import cron from 'node-cron';
import { collectFromChannel } from './connectors/telegram/telegramCollector.js';
import * as jobsService from './jobs.service.js';
import { embedPendingJobs } from '../matching/matching.service.js';
import { notifyAllEligibleUsers } from '../notifications/notification.service.js';

const TELEGRAM_CHANNELS = (process.env.TELEGRAM_CHANNELS || '')
  .split(',')
  .map((channel) => channel.trim().replace(/^@/, ''))
  .filter(Boolean);

const syncAllChannels = async () => {
  for (const channelUsername of TELEGRAM_CHANNELS) {
    try {
      const source = await jobsService.getOrCreateJobSource(
        channelUsername,
        'TELEGRAM',
        channelUsername
      );
      const posts = await collectFromChannel(channelUsername, 30);
      const result = await jobsService.ingestRawPosts(posts, source.id);

      const embedResult = await embedPendingJobs();

      console.log(`[scheduler] ${channelUsername}:`, result);
      
  const notifyResult = await notifyAllEligibleUsers();
  console.log('[scheduler] notifications:', notifyResult);
    } catch (err) {
      console.error(`[scheduler] failed for ${channelUsername}:`, err.message);
    }
  }
};

export const startJobScheduler = () => {
  if (TELEGRAM_CHANNELS.length === 0) {
    console.log('Job aggregation scheduler skipped: no TELEGRAM_CHANNELS configured.');
    return;
  }

  cron.schedule('*/30 * * * *', syncAllChannels);
  console.log('Job aggregation scheduler started (every 30 min).');
};
