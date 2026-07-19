import { Router } from "express";
import { requireAuth, requireAdmin } from "../../middleware/authMiddleware.js";
import * as jobsController from "./jobs.controller.js";

const router = Router();

router.get("/", requireAuth, jobsController.getJobs);
router.get("/sources", requireAuth, requireAdmin, jobsController.getJobSources);
router.patch(
  "/sources/:id/toggle",
  requireAuth,
  requireAdmin,
  jobsController.toggleSource,
);
router.post(
  "/sync/website-generic",
  requireAuth,
  requireAdmin,
  jobsController.syncGenericWebsite,
);
router.post(
  "/sync/telegram",
  requireAuth,
  requireAdmin,
  jobsController.syncTelegramChannel,
);
router.post(
  "/sync/website",
  requireAuth,
  requireAdmin,
  jobsController.syncWebsite,
);

router.post(
  "/discover-channels",
  requireAuth,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { discoverChannels } =
        await import("./connectors/telegram/channelDiscovery.js");
      const result = await discoverChannels();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
