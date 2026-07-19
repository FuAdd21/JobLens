import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { startJobScheduler } from "./src/modules/jobs/scheduler.js";
import { expireStaleJobs } from "./src/modules/jobs/jobExpiry.js";

app.listen(env.port, async () => {
  console.log(`JobLens API running on port ${env.port}`);
  await expireStaleJobs();
  startJobScheduler();
});
