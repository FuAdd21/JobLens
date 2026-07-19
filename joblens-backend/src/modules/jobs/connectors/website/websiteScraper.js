import axios from "axios";
import { adapters } from "./adapters/index.js";

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; JobLensBot/1.0)",
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
