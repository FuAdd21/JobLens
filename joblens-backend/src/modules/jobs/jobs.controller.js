import * as jobsService from "./jobs.service.js";
import { collectFromChannel } from "./connectors/telegram/telegramCollector.js";
import { scrapeSite } from "./connectors/website/websiteScraper.js";
import { scrapeGeneric } from "./connectors/website/genericScraper.js";
import { embedPendingJobs } from "../matching/matching.service.js";

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
      return res
        .status(400)
        .json({ success: false, message: "channelUsername is required." });
    }

    const normalizedChannel = channelUsername.replace(/^@/, "");
    const source = await jobsService.getOrCreateJobSource(
      normalizedChannel,
      "TELEGRAM",
      normalizedChannel,
    );

    const posts = await collectFromChannel(normalizedChannel, 50);
    const result = await jobsService.ingestRawPosts(posts, source.id);

    const embedResult = await embedPendingJobs();

    return res.json({
      success: true,
      message: "Sync complete.",
      data: { ...result, embedResult },
    });
  } catch (err) {
    next(err);
  }
};

export const syncWebsite = async (req, res, next) => {
  try {
    const { adapterKey } = req.body;
    if (!adapterKey) {
      return res
        .status(400)
        .json({ success: false, message: "adapterKey is required." });
    }

    const source = await jobsService.getOrCreateJobSource(
      adapterKey,
      "WEBSITE",
      adapterKey,
    );
    const posts = await scrapeSite(adapterKey);
    const result = await jobsService.ingestRawPosts(posts, source.id);
    const embedResult = await embedPendingJobs();

    return res.json({
      success: true,
      message: "Website sync complete.",
      data: { ...result, embedResult },
    });
  } catch (err) {
    next(err);
  }
};

export const getJobSources = async (req, res, next) => {
  try {
    const { query } = await import("../../database/pool.js");
    const { rows } = await query(
      "SELECT * FROM job_sources ORDER BY reliability_score DESC, created_at DESC",
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

export const toggleSource = async (req, res, next) => {
  try {
    const { query } = await import("../../database/pool.js");
    const { rows } = await query(
      "UPDATE job_sources SET active = NOT active WHERE id = $1 RETURNING *",
      [req.params.id],
    );
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const syncGenericWebsite = async (req, res, next) => {
  try {
    const { url, name } = req.body;
    if (!url)
      return res
        .status(400)
        .json({ success: false, message: "url is required." });

    const source = await jobsService.getOrCreateJobSource(
      name || url,
      "WEBSITE_GENERIC",
      url,
    );
    const posts = await scrapeGeneric(url);
    const result = await jobsService.ingestRawPosts(posts, source.id);

    return res.json({
      success: true,
      message: "Scrape complete.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
