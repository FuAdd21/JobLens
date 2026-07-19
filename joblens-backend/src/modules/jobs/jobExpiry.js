import { query } from '../../database/pool.js';

const STALE_DAYS_NO_DEADLINE = 45; // if no explicit deadline was parsed, assume stale after this

export const expireStaleJobs = async () => {
  // 1. Anything past its explicit parsed deadline
  const deadlineExpired = await query(
    `UPDATE jobs SET status = 'EXPIRED', updated_at = now()
     WHERE status = 'ACTIVE' AND deadline_at IS NOT NULL AND deadline_at < now()`
  );

  // 2. No deadline was found, but the post itself is old — treat as stale rather than
  //    showing it forever (per FR intent: only show jobs you can realistically still apply to)
  const staleNoDeadline = await query(
    `UPDATE jobs SET status = 'EXPIRED', updated_at = now()
     WHERE status = 'ACTIVE' AND deadline_at IS NULL
       AND posted_at < now() - interval '${STALE_DAYS_NO_DEADLINE} days'`
  );

  return {
    expiredByDeadline: deadlineExpired.rowCount,
    expiredByAge: staleNoDeadline.rowCount,
  };
};
