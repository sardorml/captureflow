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
  ASSETS: Fetcher;
  // Hostname the embedded docs answer on. Unset on deployments that don't
  // publish them, which leaves the built files unreachable rather than served
  // half-broken from a path their asset URLs don't match.
  DOCS_HOST?: string;
};

/*
 * The docs are a second static site built into this worker's own assets rather
 * than a deployment of their own, so there is one build, one publish and one
 * set of bindings. /docs is only where they're stored: on DOCS_HOST they're
 * served from the root, and the app's own origin redirects that prefix away so
 * each page keeps a single canonical URL.
 */
async function serveDocs(request: Request, env: Env): Promise<Response | null> {
  const host = env.DOCS_HOST?.toLowerCase();
  if (!host) return null;

  const url = new URL(request.url);

  /*
   * Assets are reachable on every hostname bound to this worker, so the storage
   * prefix is a second, half-working address for every page — the markup asks
   * for /assets/*, which only resolves under the rewrite below. Send it to the
   * docs host's own root instead, whichever hostname it arrives on.
   * `run_worker_first` in wrangler.jsonc is what lets this run at all: without
   * it the asset server would answer these paths before the worker sees them.
   */
  if (url.pathname === "/docs" || url.pathname.startsWith("/docs/")) {
    const target = new URL(strip(url.pathname), `https://${host}`);
    target.search = url.search;
    return Response.redirect(target.toString(), 308);
  }

  if (url.hostname.toLowerCase() !== host) return null;

  const target = new URL(url);
  target.pathname = `/docs${url.pathname}`;
  return stripDocsPrefix(await env.ASSETS.fetch(new Request(target, request)));
}

const strip = (pathname: string) => pathname.slice("/docs".length) || "/";

/*
 * The asset server normalises trailing slashes with a redirect of its own, and
 * that Location carries the prefix we rewrote in — which would put the storage
 * path in the visitor's address bar. Rewrite it back out.
 */
function stripDocsPrefix(response: Response): Response {
  const location = response.headers.get("location");
  if (!location?.startsWith("/docs")) return response;

  const headers = new Headers(response.headers);
  headers.set("location", strip(location));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

const handler: ExportedHandler<Env> = {
  async fetch(request, env, ctx) {
    return (
      (await serveDocs(request, env)) ?? openNextWorker.fetch(request, env, ctx)
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
