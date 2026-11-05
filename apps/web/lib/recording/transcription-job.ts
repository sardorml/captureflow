/// <reference types="@cloudflare/workers-types" />

import {
  getWorkspaceEntitlement,
  isSelfHosted,
  type SelfHostEnv,
} from "@captureflow/quota";
import { createD1Db } from "./db-d1";
import {
  WHISPER_MODEL,
  assembleTranscript,
  bytesToBase64,
  linesFromWhisper,
  parseLinesJson,
  whisperLanguage,
} from "./transcription";
import { generateSummaryChapters } from "./summary-ai";
import { parseSummaryChaptersJson } from "./summary-chapters";
import type { RecordingTranscript, TranscriptionJobMessage } from "./types";

/*
 * One queue message = one audio chunk through Whisper. Runs in the Worker's
 * queue consumer (worker.ts) and, under `next dev` where no consumer exists,
 * inline from the /transcribe route. Keep it free of @opennextjs imports:
 * worker.ts is bundled by wrangler, which can't resolve them.
 */
export type TranscriptionEnv = SelfHostEnv & {
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
  await addSummaryChapters(env, db, slug, transcript);
}

// On plans with AI, fills in what the owner hasn't written: a summary always, chapters unless some are there already.
async function addSummaryChapters(
  env: TranscriptionEnv,
  db: ReturnType<typeof createD1Db>,
  slug: string,
  transcript: RecordingTranscript,
): Promise<void> {
  try {
    const row = await db.getRecording(slug);
    if (!row?.workspaceId) return;
    const existing = parseSummaryChaptersJson(row.summaryChaptersJson);
    if (existing.summary) return;
    const entitlement = await getWorkspaceEntitlement(env.DB, row.workspaceId, {
      selfHosted: isSelfHosted(env),
    });
    if (!entitlement.ai) return;
    const made = await generateSummaryChapters(
      env.AI,
      transcript,
      row.durationMs,
    );
    if (!made) return;
    await db.updateRecording(slug, {
      summaryChaptersJson: JSON.stringify({
        summary: made.summary,
        chapters: existing.chapters.length ? existing.chapters : made.chapters,
      }),
    });
  } catch (err) {
    console.warn(`[transcribe] summary for ${slug} failed:`, err);
  }
}

export async function failTranscription(
  env: Pick<TranscriptionEnv, "DB">,
  { slug }: TranscriptionJobMessage,
  reason: string,
): Promise<void> {
  await createD1Db(env.DB).failTranscript(slug, reason.slice(0, 500));
}
