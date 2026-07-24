import { Router } from 'express';
import { requireAuth } from '../../middleware/authMiddleware.js';
import * as notificationController from './notification.controller.js';
import { checkNotificationsValidation } from './notification.validation.js';

const router = Router();

router.post('/check', requireAuth, checkNotificationsValidation, notificationController.checkMyNotifications);
router.get('/history', requireAuth, notificationController.getNotificationHistory);

export default router;
