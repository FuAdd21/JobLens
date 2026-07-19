import { query } from '../../database/pool.js';
import { sendMail } from './mailer.js';
import { newMatchEmail } from './notificationTemplates.js';
import { env } from '../../config/env.js';

// Finds matches that are good enough AND haven't been notified yet, per user.
const getUnnotifiedMatchesForUser = async (userId, minScore) => {
  const { rows } = await query(
    `SELECT m.job_id, m.final_score, j.title, j.location, j.source_url, o.name as organization_name
     FROM matches m
     JOIN jobs j ON j.id = m.job_id
     LEFT JOIN organizations o ON o.id = j.organization_id
     WHERE m.user_id = $1 AND m.notified = FALSE AND m.final_score >= $2 AND j.status = 'ACTIVE'
     ORDER BY m.final_score DESC`,
    [userId, minScore]
  );
  return rows;
};

const markNotified = async (userId, jobIds) => {
  if (jobIds.length === 0) return;
  await query(
    `UPDATE matches SET notified = TRUE WHERE user_id = $1 AND job_id = ANY($2::uuid[])`,
    [userId, jobIds]
  );
};

const logNotification = async (userId, jobId, status) => {
  await query(
    `INSERT INTO notification_log (user_id, job_id, status) VALUES ($1, $2, $3)`,
    [userId, jobId, status]
  );
};

// Runs for ONE user (used after a manual /matches/refresh, or per-user from the batch job)
export const notifyUserOfNewMatches = async (userId, email, minScore) => {
  const matches = await getUnnotifiedMatchesForUser(userId, minScore);
  if (matches.length === 0) return { sent: 0 };

  const html = newMatchEmail(matches);
  const success = await sendMail({
    to: email,
    subject: `${matches.length} new job match${matches.length === 1 ? '' : 'es'} on JobLens`,
    html,
  });

  const jobIds = matches.map((m) => m.job_id);
  for (const jobId of jobIds) {
    await logNotification(userId, jobId, success ? 'SENT' : 'FAILED');
  }
  if (success) await markNotified(userId, jobIds);

  return { sent: success ? matches.length : 0 };
};

// Batch job: check every user with notifications enabled (run on a schedule, after job ingestion)
export const notifyAllEligibleUsers = async () => {
  const { rows: users } = await query(
    `SELECT u.id, u.email, p.notify_min_score
     FROM users u
     JOIN profiles p ON p.user_id = u.id
     WHERE p.notifications_enabled = TRUE AND u.status = 'ACTIVE' AND u.email_verified = TRUE`
  );

  let totalSent = 0;
  for (const user of users) {
    const minScore = user.notify_min_score || env.notifyMinScore;
    const result = await notifyUserOfNewMatches(user.id, user.email, minScore);
    totalSent += result.sent;
  }
  return { usersChecked: users.length, totalNotificationsSent: totalSent };
};