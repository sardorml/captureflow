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
  // Comma-separated hostnames this deployment used to answer on. Unset for
  // self-hosters, who have only ever had one.
  LEGACY_HOSTS?: string;
  NEXT_PUBLIC_APP_WEB_SITE_URL?: string;
};

/*
 * Old hostname → same path on the canonical one. It sits in front of the app
 * rather than in middleware so it also covers /api and the static assets, and
 * it's 308 rather than 301 so a client that follows it keeps its method and
 * body. Cross-origin redirects still drop the Authorization header, so a
 * desktop or extension build old enough to call the legacy host has to be
 * updated — this only keeps links and unauthenticated GETs alive.
 */
function legacyRedirect(request: Request, env: Env): Response | null {
  const legacy = (env.LEGACY_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  if (legacy.length === 0) return null;

  const url = new URL(request.url);
  if (!legacy.includes(url.hostname.toLowerCase())) return null;

  const canonical = env.NEXT_PUBLIC_APP_WEB_SITE_URL;
  if (!canonical) return null;

  const target = new URL(url.pathname + url.search, canonical);
  return Response.redirect(target.toString(), 308);
}

const handler: ExportedHandler<Env> = {
  fetch(request, env, ctx) {
    return (
      legacyRedirect(request, env) ?? openNextWorker.fetch(request, env, ctx)
    );
  },

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
