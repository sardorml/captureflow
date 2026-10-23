/// <reference types="@cloudflare/workers-types" />

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — resolved after the OpenNext Cloudflare build runs.
import openNextWorker from "./.open-next/worker.js";
import {
  runDailyRetentionSweep,
  runHourlyMultipartGc,
} from "./lib/recording/cron";
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
};

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
        break;
      case "0 4 * * *":
        ctx.waitUntil(runDailyRetentionSweep(env));
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
