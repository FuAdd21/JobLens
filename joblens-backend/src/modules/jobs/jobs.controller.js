import * as jobsService from './jobs.service.js';
import { collectFromChannel } from './connectors/telegram/telegramCollector.js';
import { embedPendingJobs } from '../matching/matching.service.js';

export const getJobs = async (req, res, next) => {
  try {
    const result = await jobsService.listJobs(req.query);

    return res.json({
      success: true,
      data: result.jobs,
      meta: {
        page: result.page,
        limit: result.limit,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const syncTelegramChannel = async (req, res, next) => {
  try {
    const { channelUsername } = req.body;
    if (!channelUsername) {
      return res.status(400).json({ success: false, message: 'channelUsername is required.' });
    }

    const normalizedChannel = channelUsername.replace(/^@/, '');
    const source = await jobsService.getOrCreateJobSource(
      normalizedChannel,
      'TELEGRAM',
      normalizedChannel
    );

    const posts = await collectFromChannel(normalizedChannel, 50);
    const result = await jobsService.ingestRawPosts(posts, source.id);

    const embedResult = await embedPendingJobs();

    return res.json({ success: true, message: 'Sync complete.', data: { ...result, embedResult } });
  } catch (err) {
    next(err);
  }
};
