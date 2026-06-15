/// <reference types="@cloudflare/workers-types" />

// Wrapper worker entry. Re-exports OpenNext's `fetch` handler unchanged
// and adds a `scheduled()` handler so the share-cleanup cron sweeps run
// in the worker against the shared D1 + R2 bindings.
//
// Build sequence (see project.json `cf:deploy`):
//   1. `opennextjs-cloudflare build` → emits .open-next/worker.js
//   2. `wrangler deploy` bundles this file.

// `.open-next/worker.js` is produced by `opennextjs-cloudflare build`
// (gitignored). The TS import is unresolvable on a fresh checkout
// without a prior build pass.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — resolved after the OpenNext Cloudflare build runs.
import openNextWorker from './.open-next/worker.js';
import { runDailyRetentionSweep, runHourlyMultipartGc } from './lib/share/cron';

type Env = {
  DB: D1Database;
  BUCKET: R2Bucket;
};

const handler: ExportedHandler<Env> = {
  fetch: openNextWorker.fetch,

  async scheduled(
    event: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    switch (event.cron) {
      case '0 * * * *':
        ctx.waitUntil(runHourlyMultipartGc(env));
        break;
      case '0 4 * * *':
        ctx.waitUntil(runDailyRetentionSweep(env));
        break;
      default:
        console.warn(`[cron] unknown schedule: ${event.cron}`);
    }
  },
};

export default handler;
