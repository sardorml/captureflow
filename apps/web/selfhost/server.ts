import { join } from "node:path";
import {
  applyMigrations,
  applyPublicOrigin,
  createLocalQueue,
  createRuntime,
  createWhisperAi,
  ensureSecrets,
  serveNextAt,
  setInjectedEnv,
  startCron,
  stringEnv,
  type QueueOutcome,
} from "@captureflow/selfhost";
import {
  backfillPosterDerivatives,
  runDailyRetentionSweep,
  runHourlyMultipartGc,
  sweepUploadSegments,
} from "../lib/recording/cron";
import { hydrateTranscriptionJobMessage } from "../lib/recording/transcription";
import {
  failTranscription,
  processTranscriptionPart,
} from "../lib/recording/transcription-job";
import type { TranscriptionJobMessage } from "../lib/recording/types";

/*
 * Docker entry for apps/web: builds Node stand-ins for every Cloudflare
 * binding, hands them to the cf-env wrappers through the env slot, runs what
 * worker.ts runs on Cloudflare (crons, the transcription queue consumer),
 * then boots Next's standalone server in this same process.
 */

// Same as the consumer's max_retries in wrangler.jsonc (see worker.ts).
const TRANSCRIPTION_MAX_RETRIES = 3;

const PASSTHROUGH = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "ALLOWED_EMAIL_DOMAINS",
  "BETTER_AUTH_TRUSTED_ORIGINS",
  "CAPTUREFLOW_EXTENSION_ID",
  "APP_DEEP_LINK_SCHEME",
  "DEV_DEVICE_IDS",
  "RESEND_API_KEY",
];

const appDir = process.env.CAPTUREFLOW_APP_DIR ?? process.cwd();
const runtime = createRuntime();
const { values: secrets, generated } = ensureSecrets(runtime.dataDir, [
  "BETTER_AUTH_SECRET",
]);
if (generated.length > 0)
  console.log(
    `[selfhost] generated ${generated.join(", ")} in ${runtime.dataDir}/secrets.json`,
  );

const applied = applyMigrations(
  join(runtime.dataDir, "captureflow.sqlite"),
  process.env.MIGRATIONS_DIR ?? join(appDir, "migrations"),
);
if (applied.length > 0)
  console.log(`[selfhost] applied ${applied.length} migration(s)`);

const rewritten = applyPublicOrigin(join(appDir, ".next"), runtime.appUrl);
console.log(
  `[selfhost] serving ${runtime.appUrl} (${rewritten} file(s) carry the public URL)`,
);

const AI = process.env.WHISPER_API_URL
  ? createWhisperAi({
      baseUrl: process.env.WHISPER_API_URL,
      apiKey: process.env.WHISPER_API_KEY,
      model: process.env.WHISPER_MODEL ?? "whisper-1",
    })
  : undefined;

const derived = {
  ...stringEnv(process.env, PASSTHROUGH),
  ...secrets,
  SELF_HOSTED: "true",
  BETTER_AUTH_URL: runtime.appUrl,
  APP_WEB_PUBLIC_URL: runtime.appUrl,
  NEXT_PUBLIC_APP_WEB_SITE_URL: runtime.appUrl,
  NEXT_PUBLIC_RECORDING_SITE_URL: runtime.appUrl,
  NEXT_PUBLIC_SCREENSHOT_SITE_URL: runtime.appUrl,
  NEXT_PUBLIC_MARKETING_SITE_URL: runtime.appUrl,
  R2_PUBLIC_BASE_URL: `${runtime.appUrl}/media`,
  RESEND_FROM_ADDRESS: runtime.mailFrom,
};
Object.assign(process.env, derived);

const jobEnv = { DB: runtime.DB, BUCKET: runtime.BUCKET, SELF_HOSTED: "true" };

async function consumeTranscription(
  body: unknown,
  attempts: number,
): Promise<QueueOutcome> {
  const job = hydrateTranscriptionJobMessage(body);
  if (!job) {
    console.warn("[transcribe] dropping malformed message", body);
    return "ack";
  }
  if (!AI) {
    await failTranscription(
      jobEnv,
      job,
      "Transcription is off: set WHISPER_API_URL on the server.",
    );
    return "ack";
  }
  try {
    await processTranscriptionPart({ ...jobEnv, AI }, job);
    return "ack";
  } catch (err) {
    console.warn(
      `[transcribe] ${job.slug} part ${job.partNumber} attempt ${attempts} failed:`,
      err,
    );
    if (attempts > TRANSCRIPTION_MAX_RETRIES) {
      await failTranscription(jobEnv, job, String(err));
      return "ack";
    }
    return { retryDelaySeconds: 30 * attempts };
  }
}

const queue = createLocalQueue<TranscriptionJobMessage>(
  join(runtime.dataDir, "jobs.sqlite"),
  consumeTranscription,
);

setInjectedEnv({
  ...derived,
  DB: runtime.DB,
  BUCKET: runtime.BUCKET,
  EMAIL: runtime.EMAIL,
  AI,
  TRANSCRIPTION_QUEUE: queue.producer,
});

queue.start();
const stopCron = startCron([
  { cron: "0 * * * *", run: () => runHourlyMultipartGc(jobEnv) },
  { cron: "0 * * * *", run: () => backfillPosterDerivatives(jobEnv) },
  { cron: "0 * * * *", run: () => sweepUploadSegments(jobEnv) },
  { cron: "0 4 * * *", run: () => runDailyRetentionSweep(jobEnv) },
]);

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.once(signal, () => {
    stopCron();
    void queue.stop().finally(() => process.exit(0));
  });
}

serveNextAt(
  runtime.appUrl,
  process.env.BIND_HOST ?? "0.0.0.0",
  Number(process.env.PORT ?? 3000),
);
// Next's standalone server; the Dockerfile puts this bundle beside it.
await import("./server.js");
