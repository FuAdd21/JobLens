import { Router } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/authMiddleware.js';
import * as jobsController from './jobs.controller.js';

const router = Router();

router.get('/', requireAuth, jobsController.getJobs);
router.post('/sync/telegram', requireAuth, requireAdmin, jobsController.syncTelegramChannel);

export default router;
