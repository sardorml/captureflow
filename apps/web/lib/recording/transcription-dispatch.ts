import { after } from "next/server";
import { getCloudflareEnv } from "./cf-env";
import {
  failTranscription,
  processTranscriptionPart,
  type TranscriptionEnv,
} from "./transcription-job";
import type { TranscriptionJobMessage } from "./types";

// Queues take at most this many messages per sendBatch call.
const SEND_BATCH_LIMIT = 100;

/*
 * Hands the job's parts to the Worker's queue consumer. `next dev` has no
 * consumer, so there the parts run inline after the response instead.
 */
export async function dispatchTranscription(
  messages: TranscriptionJobMessage[],
): Promise<void> {
  const env = await getCloudflareEnv();
  if (process.env.NODE_ENV === "development") {
    if (!env?.DB || !env.BUCKET || !env.AI) {
      throw new Error("Workers AI binding (AI) not available");
    }
    const inline = env as TranscriptionEnv;
    after(() => runInline(inline, messages));
    return;
  }
  if (!env?.TRANSCRIPTION_QUEUE) {
    throw new Error("Transcription queue binding not available");
  }
  for (let i = 0; i < messages.length; i += SEND_BATCH_LIMIT) {
    await env.TRANSCRIPTION_QUEUE.sendBatch(
      messages.slice(i, i + SEND_BATCH_LIMIT).map((body) => ({ body })),
    );
  }
}

async function runInline(
  env: TranscriptionEnv,
  messages: TranscriptionJobMessage[],
): Promise<void> {
  for (const message of messages) {
    try {
      await processTranscriptionPart(env, message);
    } catch (err) {
      console.warn(`[transcribe] part ${message.partNumber} failed:`, err);
      await failTranscription(env, message, String(err));
      return;
    }
  }
}
