import { isInsideCut, type RecordingCut } from "./cuts";
import type {
  RecordingTranscript,
  TranscriptResponse,
  TranscriptRow,
  TranscriptSegment,
  TranscriptWord,
} from "./types";

// Caps bound the stored blob; the assembled transcript and the owner's edits
// both pass through here before they are served.
const MAX_SEGMENTS = 2_000;
const MAX_WORDS = 20_000;
const MAX_SEGMENT_CHARS = 1_000;
const MAX_WORD_CHARS = 100;
const SEGMENT_ID = /^[A-Za-z0-9_-]{1,32}$/;
const CAPTION_HOLD_MS = 400;
const MIN_CAPTION_MS = 100;
const MAX_CAPTION_CHARS = 42;
const LANGUAGE_TAG = /^[A-Za-z]{2,3}(-[A-Za-z0-9]{1,8})*$/;

export type TranscriptEdits = {
  segments: { id: string; text: string }[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
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
  if (!Array.isArray(raw.segments)) return null;
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
  return { version: 1, language: hydrateLanguage(raw.language), segments };
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

// A ready row whose transcript turned out empty (silence) reads as "none".
export function resolveTranscript(
  row: TranscriptRow | null,
): TranscriptResponse {
  if (!row) return { status: "none", transcript: null, hasEdits: false };
  if (row.status !== "ready") {
    return { status: row.status, transcript: null, hasEdits: false };
  }
  const edited = parseTranscriptJson(row.editedJson);
  if (edited) return { status: "ready", transcript: edited, hasEdits: true };
  const auto = parseTranscriptJson(row.autoJson);
  return auto
    ? { status: "ready", transcript: auto, hasEdits: false }
    : { status: "none", transcript: null, hasEdits: false };
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

// A line's words with their timings. A line whose text the owner fixed has
// lost its word timings, so its length is shared out by character count.
export function segmentWords(segment: TranscriptSegment): TranscriptWord[] {
  if (segment.words?.length) return segment.words;
  const parts = segment.text.split(" ").filter(Boolean);
  const totalChars = parts.reduce((sum, part) => sum + part.length, 0);
  const length = segment.endMs - segment.startMs;
  let chars = 0;
  return parts.map((text) => {
    const startMs = segment.startMs + (length * chars) / totalChars;
    chars += text.length;
    return {
      text,
      startMs: Math.round(startMs),
      endMs: Math.round(segment.startMs + (length * chars) / totalChars),
    };
  });
}

// A word belongs to whichever span holds its middle, so a cut landing partway
// through a word still decides it one way.
function wordMiddleMs(word: TranscriptWord): number {
  return Math.floor((word.startMs + word.endMs) / 2);
}

export function isWordInSpan(
  word: TranscriptWord,
  span: RecordingCut,
): boolean {
  const middle = wordMiddleMs(word);
  return middle >= span.startMs && middle < span.endMs;
}

export function isWordCut(
  word: TranscriptWord,
  cuts: readonly RecordingCut[],
): boolean {
  return isInsideCut(wordMiddleMs(word), cuts);
}

// The transcript as playback hears it: cut words gone, emptied lines dropped.
export function keptSegments(
  segments: readonly TranscriptSegment[],
  cuts: readonly RecordingCut[],
): TranscriptSegment[] {
  return segments.flatMap((segment) => {
    const words = segmentWords(segment);
    const kept = words.filter((word) => !isWordCut(word, cuts));
    if (kept.length === words.length) return [segment];
    if (kept.length === 0) return [];
    return [
      { ...segment, text: kept.map((w) => w.text).join(" "), words: kept },
    ];
  });
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

// A caption's words, ending at each line of the transcript and before the text
// would outgrow what reads comfortably on screen.
function captionGroups(
  segments: readonly TranscriptSegment[],
): TranscriptWord[][] {
  return segments.flatMap((segment) => {
    const groups: TranscriptWord[][] = [];
    let chars = 0;
    for (const word of segmentWords(segment)) {
      const last = groups[groups.length - 1];
      if (last && chars + word.text.length + 1 <= MAX_CAPTION_CHARS) {
        last.push(word);
        chars += word.text.length + 1;
      } else {
        groups.push([word]);
        chars = word.text.length;
      }
    }
    return groups;
  });
}

// The captions the player shows: each caption grows a word at a time, then
// swaps for the next. A cue lasts to the next word, or briefly past a pause.
export function transcriptToCaptionVtt(
  transcript: RecordingTranscript,
  cuts: readonly RecordingCut[] = [],
): string {
  const groups = captionGroups(keptSegments(transcript.segments, cuts));
  const lines = ["WEBVTT", ""];
  let index = 0;
  groups.forEach((group, g) => {
    group.forEach((word, i) => {
      const next = group[i + 1] ?? groups[g + 1]?.[0];
      const shown = Math.max(word.endMs, word.startMs + MIN_CAPTION_MS);
      // Browsers count a cue's end as inside it, so one ending exactly where the
      // next starts shows both when the player is paused on that moment.
      const endMs = next
        ? Math.min(next.startMs - 1, shown + CAPTION_HOLD_MS)
        : shown;
      if (endMs <= word.startMs) return;
      index++;
      lines.push(
        String(index),
        `${vttTime(word.startMs)} --> ${vttTime(endMs)}`,
        escapeCue(
          group
            .slice(0, i + 1)
            .map((w) => w.text)
            .join(" "),
        ),
        "",
      );
    });
  });
  return lines.join("\n");
}

export function transcriptToVtt(
  transcript: RecordingTranscript,
  cuts: readonly RecordingCut[] = [],
): string {
  const lines = ["WEBVTT", ""];
  let index = 0;
  for (const segment of keptSegments(transcript.segments, cuts)) {
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
