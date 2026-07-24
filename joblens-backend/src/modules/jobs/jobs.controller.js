import { validationResult } from "express-validator";
import * as jobsService from "./jobs.service.js";
import { collectFromChannel } from "./connectors/telegram/telegramCollector.js";
import { scrapeGeneric, scrapeSite } from "./connectors/website/genericScraper.js";
import { discoverChannels } from "./connectors/telegram/channelDiscovery.js";
import { embedPendingJobs } from "../matching/matching.service.js";

const validateRequest = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  // FIXED: mutating job endpoints now check express-validator results before doing work.
  res.status(400).json({ success: false, message: "Validation failed.", errors: errors.array() });
  return true;
};

export const getJobs = async (req, res, next) => {
  try {
    const result = await jobsService.listJobs(req.query);

    return res.json({
      success: true,
      // FIXED: pagination metadata is nested under data to keep the response envelope consistent.
      data: {
        items: result.jobs,
        meta: {
          page: result.page,
          limit: result.limit,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const syncTelegramChannel = async (req, res, next) => {
  try {
    if (validateRequest(req, res)) return;

    const { channelUsername } = req.body;

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
    if (validateRequest(req, res)) return;

    const { adapterKey } = req.body;

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
    // FIXED: controller delegates source queries to jobs.service.js.
    const sources = await jobsService.listJobSources();
    return res.json({ success: true, data: sources });
  } catch (err) {
    next(err);
  }
};

export const toggleSource = async (req, res, next) => {
  try {
    if (validateRequest(req, res)) return;

    // FIXED: controller delegates source mutations to jobs.service.js.
    const source = await jobsService.toggleJobSource(req.params.id);
    if (!source) {
      return res.status(404).json({ success: false, message: "Source not found." });
    }
    return res.json({ success: true, data: source });
  } catch (err) {
    next(err);
  }
};

export const syncGenericWebsite = async (req, res, next) => {
  try {
    if (validateRequest(req, res)) return;

    const { url, name } = req.body;

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

export const discoverJobChannels = async (req, res, next) => {
  try {
    // FIXED: discovery route uses a controller handler instead of an inline async route body.
    const result = await discoverChannels();
    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
