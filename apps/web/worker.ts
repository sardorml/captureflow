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
import { sweepAgentRecordings } from "./lib/mcp/agent-recordings-db";
import { hydrateTranscriptionJobMessage } from "./lib/recording/transcription";
import {
  failTranscription,
  processTranscriptionPart,
} from "./lib/recording/transcription-job";

type Env = {
  DB: D1Database;
  BUCKET: R2Bucket;
  AI: Ai;
  SELF_HOSTED?: string;
  LEMON_API_KEY?: string;
  CLOUDFLARE_ZONE_ID?: string;
  CLOUDFLARE_PURGE_TOKEN?: string;
  R2_PUBLIC_BASE_URL?: string;
  RECORDER_SECRET?: string;
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
    this.envVars = { RECORDER_SECRET: env.RECORDER_SECRET ?? "" };
  }

  override async fetch(request: Request): Promise<Response> {
    const res = await this.containerFetch(request);
    const ended =
      request.method === "DELETE" ||
      new URL(request.url).pathname.endsWith("/stop");
    if (!ended || !res.ok) return res;
    const body = await res.arrayBuffer();
    this.ctx.waitUntil(this.stop());
    return new Response(body, res);
  }
}

// Keep equal to the consumer's max_retries in wrangler.jsonc: the delivery
// that would be the last is the one that records the failure.
const TRANSCRIPTION_MAX_RETRIES = 3;

const handler: ExportedHandler<Env> = {
  fetch(request, env, ctx) {
    return openNextWorker.fetch(request, env, ctx);
  },

  async scheduled(
    event: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    switch (event.cron) {
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
