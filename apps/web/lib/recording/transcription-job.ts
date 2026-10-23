/// <reference types="@cloudflare/workers-types" />

import { createD1Db } from "./db-d1";
import {
  WHISPER_MODEL,
  assembleTranscript,
  bytesToBase64,
  linesFromWhisper,
  parseLinesJson,
  whisperLanguage,
} from "./transcription";
import type { TranscriptionJobMessage } from "./types";

/*
 * One queue message = one audio chunk through Whisper. Runs in the Worker's
 * queue consumer (worker.ts) and, under `next dev` where no consumer exists,
 * inline from the /transcribe route. Keep it free of @opennextjs imports:
 * worker.ts is bundled by wrangler, which can't resolve them.
 */
export type TranscriptionEnv = {
  DB: D1Database;
  BUCKET: R2Bucket;
  AI: Ai;
};

export async function processTranscriptionPart(
  env: TranscriptionEnv,
  { slug, partNumber }: TranscriptionJobMessage,
): Promise<void> {
  const db = createD1Db(env.DB);
  const [job, part] = await Promise.all([
    db.getTranscript(slug),
    db.getTranscriptPart(slug, partNumber),
  ]);
  // A message that outlived its job (recording deleted, transcript re-run).
  if (!job || !part || job.status !== "pending") return;

  if (part.segmentsJson === null) {
    const object = await env.BUCKET.get(part.storageKey);
    if (!object) throw new Error(`audio part missing: ${part.storageKey}`);
    const output = await env.AI.run(WHISPER_MODEL, {
      audio: bytesToBase64(await object.arrayBuffer()),
      language: whisperLanguage(job.language),
    });
    const lines = linesFromWhisper(output, part.startMs, part.endMs);
    await db.setTranscriptPartLines(slug, partNumber, JSON.stringify(lines));
  }

  const parts = await db.listTranscriptParts(slug);
  const complete =
    parts.length === job.partCount &&
    parts.every((p) => p.segmentsJson !== null);
  if (!complete) return;
  const transcript = assembleTranscript(
    parts.map((p) => ({
      partNumber: p.partNumber,
      lines: parseLinesJson(p.segmentsJson),
    })),
    job.language,
  );
  await db.finishTranscript(slug, JSON.stringify(transcript));
}

export async function failTranscription(
  env: Pick<TranscriptionEnv, "DB">,
  { slug }: TranscriptionJobMessage,
  reason: string,
): Promise<void> {
  await createD1Db(env.DB).failTranscript(slug, reason.slice(0, 500));
}
