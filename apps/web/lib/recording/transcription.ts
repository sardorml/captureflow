import { isValidSlug } from "./slug";
import type {
  RecordingTranscript,
  TranscriptionJobMessage,
  TranscriptSegment,
  TranscriptWord,
} from "./types";

export const WHISPER_MODEL = "@cf/openai/whisper-large-v3-turbo";

// Bounds on the chunk layout a recorder may post.
const MAX_PARTS = 500;
const MAX_PART_MS = 10 * 60_000;
const LANGUAGE_TAG = /^[A-Za-z]{2,3}(-[A-Za-z0-9]{1,8})*$/;

export type TranscribeJob = {
  slug: string;
  language: string | null;
  parts: { partNumber: number; startMs: number; endMs: number }[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isMs(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

// Whisper wants the primary subtag ("en", not "en-US").
export function whisperLanguage(tag: string | null): string | undefined {
  return tag?.split("-")[0]?.toLowerCase() || undefined;
}

export function hydrateTranscribeRequest(raw: unknown): TranscribeJob | null {
  if (!isRecord(raw) || !isValidSlug(raw.slug) || !Array.isArray(raw.parts)) {
    return null;
  }
  if (raw.parts.length === 0 || raw.parts.length > MAX_PARTS) return null;
  const seen = new Set<number>();
  const parts: TranscribeJob["parts"] = [];
  for (const item of raw.parts) {
    if (!isRecord(item)) return null;
    const { partNumber, startMs, endMs } = item;
    if (
      typeof partNumber !== "number" ||
      !Number.isInteger(partNumber) ||
      partNumber < 1 ||
      seen.has(partNumber) ||
      !isMs(startMs) ||
      !isMs(endMs)
    ) {
      return null;
    }
    const start = Math.round(startMs);
    const end = Math.round(endMs);
    if (end <= start || end - start > MAX_PART_MS) return null;
    seen.add(partNumber);
    parts.push({ partNumber, startMs: start, endMs: end });
  }
  parts.sort((a, b) => a.partNumber - b.partNumber);
  const language =
    typeof raw.language === "string" && LANGUAGE_TAG.test(raw.language)
      ? raw.language
      : null;
  return { slug: raw.slug, language, parts };
}

export function hydrateTranscriptionJobMessage(
  raw: unknown,
): TranscriptionJobMessage | null {
  if (!isRecord(raw) || !isValidSlug(raw.slug)) return null;
  const { partNumber } = raw;
  if (
    typeof partNumber !== "number" ||
    !Number.isInteger(partNumber) ||
    partNumber < 1
  ) {
    return null;
  }
  return { slug: raw.slug, partNumber };
}

/*
 * Whisper answers with ~30 s segments, each carrying word timings. Lines in
 * the transcript are rebuilt from the words: a line ends at sentence
 * punctuation, or when it grows past MAX_LINE_MS / MAX_LINE_CHARS, so the
 * share page reads like captions rather than paragraphs.
 */
const MAX_LINE_MS = 12_000;
const MAX_LINE_CHARS = 160;
const SENTENCE_END = /[.!?…]["')\]]?$/;

type WhisperWord = { word: string; start: number; end: number };
type WhisperSegment = {
  start: number;
  end: number;
  text: string;
  words?: WhisperWord[];
};

function whisperSegments(output: unknown): WhisperSegment[] {
  if (!isRecord(output) || !Array.isArray(output.segments)) return [];
  const segments: WhisperSegment[] = [];
  for (const item of output.segments) {
    if (!isRecord(item)) continue;
    if (!isMs(item.start) || !isMs(item.end)) continue;
    const text = typeof item.text === "string" ? item.text : "";
    const words = Array.isArray(item.words)
      ? item.words.filter(
          (w): w is WhisperWord =>
            isRecord(w) &&
            typeof w.word === "string" &&
            isMs(w.start) &&
            isMs(w.end),
        )
      : undefined;
    segments.push({ start: item.start, end: item.end, text, words });
  }
  return segments;
}

export type TranscriptLine = Omit<TranscriptSegment, "id">;

function finishLine(words: TranscriptWord[]): TranscriptLine {
  return {
    startMs: words[0]!.startMs,
    endMs: words[words.length - 1]!.endMs,
    text: words.map((w) => w.text).join(" "),
    words,
  };
}

// Lines for one audio chunk, moved onto the recording clock by `offsetMs`
// and capped at `limitMs` (the chunk's end on that clock).
export function linesFromWhisper(
  output: unknown,
  offsetMs: number,
  limitMs: number,
): TranscriptLine[] {
  const toMs = (seconds: number): number =>
    Math.min(limitMs, offsetMs + Math.round(seconds * 1000));
  const lines: TranscriptLine[] = [];
  for (const segment of whisperSegments(output)) {
    const words: TranscriptWord[] = (segment.words ?? [])
      .map((w) => ({
        text: w.word.trim(),
        startMs: toMs(w.start),
        endMs: toMs(w.end),
      }))
      .filter((w) => w.text.length > 0 && w.endMs > w.startMs);
    if (words.length === 0) {
      const text = segment.text.replace(/\s+/g, " ").trim();
      const startMs = toMs(segment.start);
      const endMs = toMs(segment.end);
      if (text && endMs > startMs) lines.push({ startMs, endMs, text });
      continue;
    }
    let current: TranscriptWord[] = [];
    let chars = 0;
    for (const word of words) {
      if (
        current.length > 0 &&
        (word.endMs - current[0]!.startMs > MAX_LINE_MS ||
          chars + word.text.length + 1 > MAX_LINE_CHARS)
      ) {
        lines.push(finishLine(current));
        current = [];
        chars = 0;
      }
      current.push(word);
      chars += word.text.length + 1;
      if (SENTENCE_END.test(word.text)) {
        lines.push(finishLine(current));
        current = [];
        chars = 0;
      }
    }
    if (current.length > 0) lines.push(finishLine(current));
  }
  return lines;
}

export function assembleTranscript(
  parts: { partNumber: number; lines: TranscriptLine[] }[],
  language: string | null,
): RecordingTranscript {
  const ordered = [...parts].sort((a, b) => a.partNumber - b.partNumber);
  const segments: TranscriptSegment[] = [];
  for (const part of ordered) {
    for (const line of part.lines) {
      segments.push({ id: `s${segments.length + 1}`, ...line });
    }
  }
  return { version: 1, language, segments };
}

export function parseLinesJson(json: string | null): TranscriptLine[] {
  if (!json) return [];
  try {
    const raw: unknown = JSON.parse(json);
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (line): line is TranscriptLine =>
        isRecord(line) &&
        isMs(line.startMs) &&
        isMs(line.endMs) &&
        typeof line.text === "string",
    );
  } catch {
    return [];
  }
}

// Workers AI takes the audio as base64; the chunks are small (a few hundred
// KB of Opus) so a straight conversion is fine.
export function bytesToBase64(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let binary = "";
  const STEP = 0x8000;
  for (let i = 0; i < view.length; i += STEP) {
    binary += String.fromCharCode(...view.subarray(i, i + STEP));
  }
  return btoa(binary);
}
