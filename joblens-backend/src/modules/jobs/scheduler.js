import cron from 'node-cron';
import { collectFromChannel } from './connectors/telegram/telegramCollector.js';
import { discoverChannels } from './connectors/telegram/channelDiscovery.js';
import * as jobsService from './jobs.service.js';
import { embedPendingJobs } from '../matching/matching.service.js';
import { notifyAllEligibleUsers } from '../notifications/notification.service.js';

const syncAllChannels = async () => {
  const sources = await jobsService.getActiveJobSources('TELEGRAM');
  for (const source of sources) {
    try {
      const posts = await collectFromChannel(source.identifier, 30);
      const result = await jobsService.ingestRawPosts(posts, source.id);
      console.log(`[scheduler] ${source.identifier}:`, result);
    } catch (err) {
      console.error(`[scheduler] failed for ${source.identifier}:`, err.message);
    }
  }
  await embedPendingJobs();
  const notifyResult = await notifyAllEligibleUsers();
  console.log('[scheduler] notifications:', notifyResult);
};

export const startJobScheduler = () => {
  cron.schedule('*/30 * * * *', syncAllChannels); // sync every 30 min
  cron.schedule('0 3 * * 0', async () => {         // discover new channels weekly, Sunday 3am
    const result = await discoverChannels();
    console.log('[scheduler] channel discovery:', result);
  });
  console.log('Job aggregation scheduler started.');
};