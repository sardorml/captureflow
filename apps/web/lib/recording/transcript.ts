import type { RecordingCut } from "./cuts";
import type {
  RecordingTranscript,
  TranscriptResponse,
  TranscriptRow,
  TranscriptSegment,
  TranscriptSource,
  TranscriptWord,
} from "./types";

// Caps bound the stored blob so a rogue recorder can't grow it unboundedly.
const MAX_SEGMENTS = 2_000;
const MAX_WORDS = 20_000;
const MAX_SEGMENT_CHARS = 1_000;
const MAX_WORD_CHARS = 100;
const SEGMENT_ID = /^[A-Za-z0-9_-]{1,32}$/;
const LANGUAGE_TAG = /^[A-Za-z]{2,3}(-[A-Za-z0-9]{1,8})*$/;
const SOURCES: readonly TranscriptSource[] = [
  "chrome-speech-local",
  "chrome-speech-cloud",
  "apple-speech",
];

export type TranscriptEdits = {
  segments: { id: string; text: string }[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isTranscriptSource(value: unknown): value is TranscriptSource {
  return (
    typeof value === "string" && (SOURCES as readonly string[]).includes(value)
  );
}

function hydrateRange(
  start: unknown,
  end: unknown,
): { startMs: number; endMs: number } | null {
  if (typeof start !== "number" || typeof end !== "number") return null;
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  const startMs = Math.round(start);
  const endMs = Math.round(end);
  if (startMs < 0 || endMs < startMs) return null;
  return { startMs, endMs };
}

function cleanText(raw: unknown, max: number): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/\s+/g, " ").trim().slice(0, max);
}

function hydrateLanguage(raw: unknown): string | null {
  return typeof raw === "string" && LANGUAGE_TAG.test(raw) ? raw : null;
}

function hydrateWord(raw: unknown): TranscriptWord | null {
  if (!isRecord(raw)) return null;
  const range = hydrateRange(raw.startMs, raw.endMs);
  const text = cleanText(raw.text, MAX_WORD_CHARS);
  return range && text ? { text, ...range } : null;
}

function hydrateSegment(raw: unknown): TranscriptSegment | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.id !== "string" || !SEGMENT_ID.test(raw.id)) return null;
  const range = hydrateRange(raw.startMs, raw.endMs);
  const text = cleanText(raw.text, MAX_SEGMENT_CHARS);
  if (!range || !text) return null;
  const segment: TranscriptSegment = { id: raw.id, ...range, text };
  if (Array.isArray(raw.words)) {
    const words = raw.words
      .map(hydrateWord)
      .filter((w): w is TranscriptWord => w !== null);
    if (words.length > 0) segment.words = words;
  }
  return segment;
}

export function hydrateTranscript(raw: unknown): RecordingTranscript | null {
  if (!isRecord(raw) || raw.version !== 1) return null;
  if (!isTranscriptSource(raw.source) || !Array.isArray(raw.segments)) {
    return null;
  }
  const seen = new Set<string>();
  const segments: TranscriptSegment[] = [];
  let wordCount = 0;
  for (const item of raw.segments) {
    if (segments.length >= MAX_SEGMENTS) break;
    const segment = hydrateSegment(item);
    if (!segment || seen.has(segment.id)) continue;
    seen.add(segment.id);
    if (segment.words) {
      wordCount += segment.words.length;
      if (wordCount > MAX_WORDS) delete segment.words;
    }
    segments.push(segment);
  }
  if (segments.length === 0) return null;
  segments.sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs);
  return {
    version: 1,
    language: hydrateLanguage(raw.language),
    source: raw.source,
    segments,
  };
}

export function parseTranscriptJson(
  json: string | null,
): RecordingTranscript | null {
  if (!json) return null;
  try {
    return hydrateTranscript(JSON.parse(json));
  } catch {
    return null;
  }
}

/*
 * Rebuilds the transcript from `auto` using only the owner's text: timings
 * come from the auto segment with the same id, segments left out of the edit
 * (or emptied) are dropped, and word timings survive only where the text is
 * untouched. Null when the edit is malformed or would leave nothing.
 */
export function hydrateTranscriptEdits(
  raw: unknown,
  auto: RecordingTranscript,
): RecordingTranscript | null {
  if (!isRecord(raw) || !Array.isArray(raw.segments)) return null;
  const texts = new Map<string, string>();
  for (const item of raw.segments) {
    if (!isRecord(item) || typeof item.id !== "string") continue;
    texts.set(item.id, cleanText(item.text, MAX_SEGMENT_CHARS));
  }
  const segments: TranscriptSegment[] = [];
  for (const segment of auto.segments) {
    const text = texts.get(segment.id);
    if (!text) continue;
    segments.push(
      text === segment.text
        ? segment
        : {
            id: segment.id,
            startMs: segment.startMs,
            endMs: segment.endMs,
            text,
          },
    );
  }
  if (segments.length === 0) return null;
  return { ...auto, segments };
}

export function resolveTranscript(
  row: TranscriptRow | null,
): TranscriptResponse {
  if (!row) return { transcript: null, hasEdits: false };
  const edited = parseTranscriptJson(row.editedJson);
  if (edited) return { transcript: edited, hasEdits: true };
  return { transcript: parseTranscriptJson(row.autoJson), hasEdits: false };
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

function vttTime(ms: number): string {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor(ms / 60_000) % 60;
  const seconds = Math.floor(ms / 1_000) % 60;
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(ms % 1_000, 3)}`;
}

function escapeCue(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// A segment lying wholly inside a cut: the player never reaches it.
export function isSegmentCut(
  segment: TranscriptSegment,
  cuts: readonly RecordingCut[],
): boolean {
  return cuts.some(
    (cut) => segment.startMs >= cut.startMs && segment.endMs <= cut.endMs,
  );
}

export function activeSegmentId(
  segments: readonly TranscriptSegment[],
  currentMs: number,
): string | null {
  let active: string | null = null;
  for (const segment of segments) {
    if (segment.startMs > currentMs) break;
    active = segment.id;
  }
  return active;
}

export function transcriptToVtt(
  transcript: RecordingTranscript,
  cuts: readonly RecordingCut[] = [],
): string {
  const lines = ["WEBVTT", ""];
  let index = 0;
  for (const segment of transcript.segments) {
    if (isSegmentCut(segment, cuts)) continue;
    index++;
    lines.push(
      String(index),
      `${vttTime(segment.startMs)} --> ${vttTime(segment.endMs)}`,
      escapeCue(segment.text),
      "",
    );
  }
  return lines.join("\n");
}
