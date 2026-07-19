import app from './src/app.js';
import { env } from './src/config/env.js';
import { startJobScheduler } from './src/modules/jobs/scheduler.js';

app.listen(env.port, () => {
  console.log(`JobLens API running on port ${env.port}`);
  startJobScheduler();
});
