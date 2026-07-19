import * as notificationService from './notification.service.js';
import { query } from '../../database/pool.js';

// Manual trigger for testing / "check now" button
export const checkMyNotifications = async (req, res, next) => {
  try {
    const { rows } = await query('SELECT email FROM users WHERE id = $1', [req.user.sub]);
    const email = rows[0]?.email;
    const result = await notificationService.notifyUserOfNewMatches(req.user.sub, email, 0.5);
    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getNotificationHistory = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT n.*, j.title, j.source_url
       FROM notification_log n
       JOIN jobs j ON j.id = n.job_id
       WHERE n.user_id = $1
       ORDER BY n.sent_at DESC
       LIMIT 50`,
      [req.user.sub]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};