import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import * as jobsController from "./jobs.controller.js";
import {
  syncGenericWebsiteValidation,
  syncTelegramValidation,
  syncWebsiteValidation,
  toggleSourceValidation,
} from "./jobs.validation.js";

const router = Router();

// FIXED: expensive admin-only sync/discovery endpoints are rate-limited separately from auth.
const expensiveJobsLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.get("/", requireAuth, jobsController.getJobs);
router.get("/sources", requireAuth, requireAdmin, jobsController.getJobSources);
router.patch(
  "/sources/:id/toggle",
  requireAuth,
  requireAdmin,
  toggleSourceValidation,
  jobsController.toggleSource,
);
router.post(
  "/sync/website-generic",
  requireAuth,
  requireAdmin,
  expensiveJobsLimiter,
  syncGenericWebsiteValidation,
  jobsController.syncGenericWebsite,
);
router.post(
  "/sync/telegram",
  requireAuth,
  requireAdmin,
  expensiveJobsLimiter,
  syncTelegramValidation,
  jobsController.syncTelegramChannel,
);
router.post(
  "/sync/website",
  requireAuth,
  requireAdmin,
  expensiveJobsLimiter,
  syncWebsiteValidation,
  jobsController.syncWebsite,
);

router.post(
  "/discover-channels",
  requireAuth,
  requireAdmin,
  expensiveJobsLimiter,
  jobsController.discoverJobChannels,
);

export default router;
