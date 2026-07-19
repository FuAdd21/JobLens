import axios from "axios";

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; JobLensBot/1.0)",
};

export const adapters = {
  ethiojobs: {
    apiUrl: "http://api.ethiojobs.net/ethiojobs/api/jobs",
    parse: (responseData) => {
      const jobs = [];

      if (!responseData?.data) return jobs;

      for (const job of responseData.data) {
        const title = job.title;
        const description = job.description || "";
        const location = job.state || "";
        const company = job.company?.name || "";
        const slug = job.slug;

        if (title) {
          jobs.push({
            rawContent: `${title}\n${company}\n${location}\n${description}`
              .replace(/<[^>]*>/g, "")
              .trim(),
            sourceUrl: slug
              ? `https://ethiojobs.net/jobs/${slug}`
              : "https://ethiojobs.net/jobs",
            location,
            postedAt: job.date_published
              ? new Date(job.date_published)
              : new Date(),
          });
        }
      }

      return jobs;
    },
  },
};

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
