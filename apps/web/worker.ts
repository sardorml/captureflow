/// <reference types="@cloudflare/workers-types" />

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — resolved after the OpenNext Cloudflare build runs.
import openNextWorker from "./.open-next/worker.js";
import {
  runDailyRetentionSweep,
  runHourlyMultipartGc,
} from "./lib/recording/cron";

type Env = {
  DB: D1Database;
  BUCKET: R2Bucket;
};

const handler: ExportedHandler<Env> = {
  fetch: openNextWorker.fetch,

  async scheduled(
    event: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    switch (event.cron) {
      case "0 * * * *":
        ctx.waitUntil(runHourlyMultipartGc(env));
        break;
      case "0 4 * * *":
        ctx.waitUntil(runDailyRetentionSweep(env));
        break;
      default:
        console.warn(`[cron] unknown schedule: ${event.cron}`);
    }
  },
};

export default handler;
