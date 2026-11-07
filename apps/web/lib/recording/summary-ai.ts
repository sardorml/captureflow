/// <reference types="@cloudflare/workers-types" />

import {
  hydrateSummaryChapters,
  type RecordingChapter,
  type RecordingSummaryChapters,
} from "./summary-chapters";
import type { RecordingTranscript } from "./types";

export const SUMMARY_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

// About six thousand tokens of speech; a longer transcript is cut, and the model is told so.
const MAX_TRANSCRIPT_CHARS = 24_000;
const MAX_CHAPTERS = 12;
const MIN_CHAPTER_GAP_MS = 15_000;
const MIN_WORDS = 20;

export const SUMMARY_SYSTEM = [
  "You write the summary and chapters for a screen recording, from its transcript.",
  'Reply with JSON only, in this shape: {"summary": string, "chapters": [{"ms": number, "title": string}]}.',
  "The summary is two to four plain sentences saying what the recording shows and what the viewer learns, in the transcript's language. No preamble, no bullet points.",
  "Chapters mark where the subject changes: at most twelve, the first at 0, each title two to six words. ms is the chapter's start in milliseconds, taken from the timestamps given.",
  "A short or single-subject recording gets a summary and no chapters.",
].join(" ");

const stamp = (ms: number) => {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export function summaryPrompt(transcript: RecordingTranscript): string {
  const lines = transcript.segments.map(
    (s) => `[${stamp(s.startMs)} · ${s.startMs}ms] ${s.text.trim()}`,
  );
  let text = lines.join("\n");
  if (text.length > MAX_TRANSCRIPT_CHARS) {
    text = `${text.slice(0, MAX_TRANSCRIPT_CHARS)}\n[transcript cut here]`;
  }
  return `Transcript:\n${text}`;
}

const wordCount = (transcript: RecordingTranscript) =>
  transcript.segments.reduce(
    (n, s) => n + s.text.split(/\s+/).filter(Boolean).length,
    0,
  );

// "1:05" or "0:05:12" to milliseconds.
function stampToMs(value: string): number | null {
  const parts = value.trim().split(":").map(Number);
  if (parts.length < 2 || parts.length > 3 || parts.some(Number.isNaN)) {
    return null;
  }
  return parts.reduce((total, part) => total * 60 + part, 0) * 1000;
}

function chapterMs(raw: Record<string, unknown>): number | null {
  if (typeof raw.ms === "number" && Number.isFinite(raw.ms)) return raw.ms;
  if (typeof raw.at === "string") return stampToMs(raw.at);
  if (typeof raw.seconds === "number" && Number.isFinite(raw.seconds)) {
    return raw.seconds * 1000;
  }
  return null;
}

// Text that may wrap JSON in prose or a code fence.
function jsonIn(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

// The model's reply: Workers AI hands JSON back parsed, other replies as text.
export function parseSummaryChapters(
  reply: unknown,
  endMs: number,
): RecordingSummaryChapters | null {
  const raw = typeof reply === "string" ? jsonIn(reply) : reply;
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const summary =
    typeof r.summary === "string" ? r.summary.replace(/\s+/g, " ").trim() : "";
  if (!summary) return null;
  const chapters: RecordingChapter[] = [];
  for (const item of Array.isArray(r.chapters) ? r.chapters : []) {
    if (!item || typeof item !== "object") continue;
    const c = item as Record<string, unknown>;
    const ms = chapterMs(c);
    const title = typeof c.title === "string" ? c.title.trim() : "";
    if (ms === null || !title || ms < 0 || (endMs > 0 && ms >= endMs)) {
      continue;
    }
    const last = chapters.at(-1);
    if (last && ms - last.ms < MIN_CHAPTER_GAP_MS) continue;
    chapters.push({ id: `c${chapters.length + 1}`, ms: Math.round(ms), title });
    if (chapters.length === MAX_CHAPTERS) break;
  }
  return hydrateSummaryChapters({ summary, chapters });
}

/*
 * A summary and chapters for a transcribed recording: one more pass over the
 * transcript. Null when there's too little speech to say anything about, or
 * the model didn't answer in the shape asked for.
 */
export async function generateSummaryChapters(
  ai: Ai,
  transcript: RecordingTranscript,
  durationMs: number | null,
): Promise<RecordingSummaryChapters | null> {
  if (wordCount(transcript) < MIN_WORDS) return null;
  const out = await ai.run(SUMMARY_MODEL, {
    messages: [
      { role: "system", content: SUMMARY_SYSTEM },
      { role: "user", content: summaryPrompt(transcript) },
    ],
    max_tokens: 700,
    temperature: 0.2,
  });
  const reply =
    out && typeof out === "object" && "response" in out ? out.response : null;
  const endMs = durationMs ?? transcript.segments.at(-1)?.endMs ?? 0;
  return parseSummaryChapters(reply, endMs);
}
