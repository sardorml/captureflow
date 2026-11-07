/// <reference types="@cloudflare/workers-types" />

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — resolved after the OpenNext Cloudflare build runs.
import openNextWorker from "./.open-next/worker.js";
import { Container } from "@cloudflare/containers";
import {
  backfillPosterDerivatives,
  retryCdnPurges,
  runDailyRetentionSweep,
  runHourlyMultipartGc,
  sweepUploadSegments,
} from "./lib/recording/cron";
import { runDailySeatSync } from "./lib/billing/seat-cron";
import { refreshRepoStats, serveRepoStats } from "./lib/github";
import {
  cachedStylesheets,
  stylesheetName,
  stylesheetText,
  TRACK_CACHED_STYLESHEETS,
} from "./lib/inline-stylesheet";
import { langOf, splitLocale } from "./lib/i18n/config";
import {
  endAgentRecording,
  sweepAgentRecordings,
} from "./lib/mcp/agent-recordings-db";
import { hydrateTranscriptionJobMessage } from "./lib/recording/transcription";
import {
  failTranscription,
  processTranscriptionPart,
} from "./lib/recording/transcription-job";

type Env = {
  DB: D1Database;
  BUCKET: R2Bucket;
  ASSETS: Fetcher;
  AI: Ai;
  BETTER_AUTH_URL?: string;
  CAPTUREFLOW_HOSTED?: string;
  LEMON_API_KEY?: string;
  CLOUDFLARE_ZONE_ID?: string;
  CLOUDFLARE_PURGE_TOKEN?: string;
  R2_PUBLIC_BASE_URL?: string;
  RECORDER_SECRET?: string;
  RECORDER_MUSIC?: string;
  GITHUB_TOKEN?: string;
};

// The cloud browser behind agent recordings (apps/recorder), one container
// per session. It sleeps a minute past the recorder's own idle limit, and
// right away once the session is stopped or cancelled.
export class RecorderContainer extends Container<Env> {
  defaultPort = 8080;
  sleepAfter = "3m";
  pingEndpoint = "recorder/ping";

  constructor(ctx: DurableObjectState<{}>, env: Env) {
    super(ctx, env);
    this.envVars = {
      RECORDER_SECRET: env.RECORDER_SECRET ?? "",
      RECORDER_MUSIC: env.RECORDER_MUSIC ?? "",
    };
  }

  override async fetch(request: Request): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (request.method === "POST" && path.endsWith("/demo")) {
      this.ctx.waitUntil(this.runDemo(request, path.split("/")[2] ?? ""));
      return Response.json({ ok: true }, { status: 202 });
    }
    const res = await this.containerFetch(request);
    const ended = request.method === "DELETE" || path.endsWith("/stop");
    if (!ended || !res.ok) return res;
    const body = await res.arrayBuffer();
    this.ctx.waitUntil(this.stop());
    return new Response(body, res);
  }

  /*
   * A swarm demo takes minutes, longer than the page that asked for it can
   * wait, so the request is answered at once and the container's reply is
   * awaited here. The open request keeps the container's idle timer fresh;
   * when the clip is uploaded, or the demo fails, the session's row is ended
   * so its minutes stop counting and the next demo may start.
   */
  private async runDemo(request: Request, id: string) {
    try {
      const res = await this.containerFetch(request);
      if (!res.ok) console.warn(`[swarm-demo] ${id}: ${await res.text()}`);
    } catch (err) {
      console.warn(`[swarm-demo] ${id} failed:`, err);
    } finally {
      await endAgentRecording(this.env.DB, id, Date.now()).catch((err) =>
        console.error(`[swarm-demo] ${id} not ended:`, err),
      );
      await this.stop();
    }
  }
}

// Reads one file for the editor's waveform (apps/waveform), then stops, so it
// costs only the time the job takes.
export class WaveformContainer extends Container<Env> {
  defaultPort = 8080;
  sleepAfter = "2m";
  pingEndpoint = "waveform/ping";

  override async fetch(request: Request): Promise<Response> {
    const res = await this.containerFetch(request);
    const body = await res.arrayBuffer();
    this.ctx.waitUntil(this.stop());
    return new Response(body, res);
  }
}

// Keep equal to the consumer's max_retries in wrangler.jsonc: the delivery
// that would be the last is the one that records the failure.
const TRANSCRIPTION_MAX_RETRIES = 3;

// The middleware reads the visitor's country from this header. Cloudflare
// sends it only while the zone's IP geolocation setting is on, so fill it in.
function withCountry(request: Request): Request {
  const country = request.cf?.country;
  if (typeof country !== "string" || request.headers.has("cf-ipcountry")) {
    return request;
  }
  const headers = new Headers(request.headers);
  headers.set("cf-ipcountry", country);
  return new Request(request, { headers });
}

/*
 * Rewrites a page's HTML on the way out; other responses pass through.
 *
 * Stylesheets ride inside the HTML. As a separate request each one shares a
 * slow link with the fonts, images and script chunks found in the same head,
 * and first paint waits for it; inline, it arrives before any of them is
 * known. The link stays, disabled, so the browser does not fetch it and React
 * still finds the stylesheet it expects. A stylesheet the browser already has
 * cached is left as a plain link, so only a first visit carries it in the
 * HTML. Next's own `inlineCss` copies the stylesheet into every route's
 * server chunk instead, which put the Worker past its size limit.
 *
 * The root layout is static, so a translated page's HTML arrives saying
 * lang="en". Search engines read the language from that attribute and the
 * Content-Language header, so both are set here.
 */
async function withPageRewrites(
  pending: Response | Promise<Response>,
  assets: Fetcher,
  origin: string,
  cached: Set<string>,
  lang: string | null,
): Promise<Response> {
  const response = await pending;
  if (!response.headers.get("content-type")?.includes("text/html")) {
    return response;
  }
  const rewriter = new HTMLRewriter().on(
    'link[rel="stylesheet"][data-precedence]',
    {
      async element(link) {
        const href = link.getAttribute("href");
        if (!href?.startsWith("/_next/static/")) return;
        if (cached.has(stylesheetName(href))) return;
        const css = await stylesheetText(assets, href, origin);
        if (css === null) return;
        link.before(`<style>${css}</style>`, { html: true });
        link.setAttribute("disabled", "");
      },
    },
  );
  rewriter.on("head", {
    element: (head) =>
      void head.append(`<script>${TRACK_CACHED_STYLESHEETS}</script>`, {
        html: true,
      }),
  });
  if (lang) {
    rewriter.on("html", {
      element: (html) => void html.setAttribute("lang", lang),
    });
  }
  const page = rewriter.transform(response);
  if (lang) page.headers.set("content-language", lang);
  return page;
}

const handler: ExportedHandler<Env> = {
  fetch(request, env, ctx) {
    if (
      request.method === "GET" &&
      new URL(request.url).pathname === "/api/github"
    ) {
      return serveRepoStats(request, env.BUCKET, env.GITHUB_TOKEN, (work) =>
        ctx.waitUntil(work),
      );
    }
    const response = openNextWorker.fetch(withCountry(request), env, ctx);
    const url = new URL(request.url);
    const [locale] = splitLocale(url.pathname);
    return withPageRewrites(
      response,
      env.ASSETS,
      url.origin,
      cachedStylesheets(request.headers.get("cookie")),
      locale ? langOf(locale) : null,
    );
  },

  async scheduled(
    event: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    switch (event.cron) {
      case "*/5 * * * *":
        ctx.waitUntil(refreshRepoStats(env.BUCKET, env.GITHUB_TOKEN));
        break;
      case "0 * * * *":
        ctx.waitUntil(runHourlyMultipartGc(env));
        ctx.waitUntil(backfillPosterDerivatives(env));
        ctx.waitUntil(retryCdnPurges(env));
        ctx.waitUntil(sweepUploadSegments(env));
        ctx.waitUntil(sweepAgentRecordings(env.DB, Date.now()));
        break;
      case "0 4 * * *":
        ctx.waitUntil(runDailyRetentionSweep(env));
        ctx.waitUntil(runDailySeatSync(env));
        break;
      default:
        console.warn(`[cron] unknown schedule: ${event.cron}`);
    }
  },

  // One audio chunk per message; a Whisper call per chunk.
  async queue(batch: MessageBatch<unknown>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      const job = hydrateTranscriptionJobMessage(message.body);
      if (!job) {
        console.warn("[transcribe] dropping malformed message", message.body);
        message.ack();
        continue;
      }
      try {
        await processTranscriptionPart(env, job);
        message.ack();
      } catch (err) {
        console.warn(
          `[transcribe] ${job.slug} part ${job.partNumber} attempt ${message.attempts} failed:`,
          err,
        );
        if (message.attempts > TRANSCRIPTION_MAX_RETRIES) {
          await failTranscription(env, job, String(err));
          message.ack();
        } else {
          message.retry({ delaySeconds: 30 * message.attempts });
        }
      }
    }
  },
};

export default handler;
