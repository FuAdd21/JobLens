import axios from 'axios';
import * as cheerio from 'cheerio';
import { adapters } from './adapters/index.js';
import { logger } from '../../../../utils/logger.js';

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; JobLensBot/1.0)',
};
const JOB_TITLE_HINTS = /\b(vacancy|job|position|hiring|apply|career|opportunity)\b/i;
const NEGATIVE_HINTS = /\b(login|sign in|register|subscribe|advertisement|cookie|privacy policy)\b/i;

export const scrapeSite = async (adapterKey) => {
  const adapter = adapters[adapterKey];
  if (!adapter) throw new Error(`No adapter registered for "${adapterKey}"`);

  const { data } = await axios.get(adapter.apiUrl, {
    headers: DEFAULT_HEADERS,
    timeout: DEFAULT_TIMEOUT_MS,
    params: { page: 1, per_page: 20 },
  });

  return adapter.parse(data);
};

const fetchHtml = async (url) => {
  try {
    const expectedHost = new URL(url).host;
    const { data, request } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JobLensBot/1.0; +https://joblens.app)' },
      maxRedirects: 3,
      timeout: 15000,
    });
    const finalUrl = request?.res?.responseUrl || url;
    if (new URL(finalUrl).host !== expectedHost) {
      // FIXED: generic scraper refuses redirects into unexpected domains.
      throw Object.assign(new Error('Scraper redirect crossed to an unexpected domain.'), { status: 400 });
    }
    return cheerio.load(data);
  } catch (err) {
    // FIXED: unavailable target sites produce an empty scrape result instead of an unhandled throw.
    logger.warn(`[scraper] failed to fetch ${url}:`, err.message);
    return cheerio.load('');
  }
};

// Heuristic: job listing pages are almost always repeated "cards" — the same tag/class
// pattern repeated N times, each containing a link and a short heading-like text.
// Instead of hardcoding selectors, find the most-repeated container structure on the page.
const findRepeatedContainers = ($) => {
  const candidates = {};

  $('a').each((i, el) => {
    const $el = $(el);
    const text = $el.text().trim();
    if (text.length < 8 || text.length > 150) return;
    if (NEGATIVE_HINTS.test(text)) return;

    // Walk up to find a reasonably-sized parent "card" container
    const $container = $el.closest('li, article, div, tr');
    if (!$container.length) return;

    const key = $container.attr('class') || $container.prop('tagName');
    if (!key) return;

    if (!candidates[key]) candidates[key] = [];
    candidates[key].push({ container: $container, link: $el, text });
  });

  // The container class/tag that repeats the most is almost certainly the listing structure
  let bestKey = null;
  let bestCount = 0;
  for (const [key, items] of Object.entries(candidates)) {
    if (items.length > bestCount) {
      bestCount = items.length;
      bestKey = key;
    }
  }

  return bestKey ? candidates[bestKey] : [];
};

const extractLocationNear = ($, $container) => {
  const knownLocations = ['Addis Ababa', 'Adama', 'Hawassa', 'Bahir Dar', 'Mekelle', 'Remote', 'Dire Dawa'];
  const containerText = $container.text();
  const found = knownLocations.find((loc) => containerText.includes(loc));
  return found || null;
};

export const scrapeGeneric = async (baseUrl) => {
  const $ = await fetchHtml(baseUrl);
  const candidates = findRepeatedContainers($);

  const seen = new Set();
  const jobs = [];

  for (const { container, link, text } of candidates) {
    const href = link.attr('href');
    if (!href || seen.has(href)) continue;
    seen.add(href);

    // Prefer entries whose text or nearby content actually smells like a job posting —
    // filters out nav links, footer links, unrelated cards caught by the container heuristic
    const containerText = container.text();
    const looksLikeJob = JOB_TITLE_HINTS.test(text) || JOB_TITLE_HINTS.test(containerText);

    const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).toString();

    jobs.push({
      rawContent: text,
      sourceUrl: fullUrl,
      location: extractLocationNear($, container),
      postedAt: new Date(),
      _confidence: looksLikeJob ? 'high' : 'low',
    });
  }

  // Only keep high-confidence matches by default — low-confidence entries are usually
  // nav/footer noise the container heuristic accidentally swept up
  return jobs.filter((j) => j._confidence === 'high').map(({ _confidence, ...j }) => j);
};
