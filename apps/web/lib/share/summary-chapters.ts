// Server-backed persistence for the share viewer's Summary + Chapters
// block. The data lives as a JSON sidecar in R2 (parallel to share-
// config) so all viewers see the same thing regardless of browser —
// the old localStorage-only scheme stranded edits on the owner's
// device.

import { getObjectJson, putObjectJson } from './r2';

export type ShareChapter = {
  id: string;
  // Offset into the video, in milliseconds.
  ms: number;
  title: string;
};

export type ShareSummaryChapters = {
  summary: string;
  chapters: ShareChapter[];
};

export const EMPTY_SUMMARY_CHAPTERS: ShareSummaryChapters = {
  summary: '',
  chapters: [],
};

// Sidecar key — `<videoKey>.summary-chapters.json` next to the video
// in R2. Owners write; everyone reads.
export function summaryChaptersKeyFor(videoStorageKey: string): string {
  return `${videoStorageKey}.summary-chapters.json`;
}

// Validates and normalizes a payload coming from the client. Drops
// any chapter row that isn't shaped like a `ShareChapter`. Caps the
// summary length so a malicious owner can't grow the sidecar
// unboundedly.
const MAX_SUMMARY_LENGTH = 4_000;
const MAX_CHAPTERS = 100;

export function hydrateSummaryChapters(raw: unknown): ShareSummaryChapters {
  if (!raw || typeof raw !== 'object') return EMPTY_SUMMARY_CHAPTERS;
  const r = raw as Record<string, unknown>;
  const summary =
    typeof r.summary === 'string' ? r.summary.slice(0, MAX_SUMMARY_LENGTH) : '';
  const chapters = Array.isArray(r.chapters)
    ? r.chapters
        .filter(
          (c): c is ShareChapter =>
            !!c &&
            typeof c === 'object' &&
            typeof (c as ShareChapter).id === 'string' &&
            typeof (c as ShareChapter).ms === 'number' &&
            Number.isFinite((c as ShareChapter).ms) &&
            typeof (c as ShareChapter).title === 'string'
        )
        .slice(0, MAX_CHAPTERS)
        .sort((a, b) => a.ms - b.ms)
    : [];
  return { summary, chapters };
}

export async function loadSummaryChapters(
  videoStorageKey: string
): Promise<ShareSummaryChapters> {
  const raw = await getObjectJson<unknown>(
    summaryChaptersKeyFor(videoStorageKey)
  ).catch(() => null);
  return raw ? hydrateSummaryChapters(raw) : EMPTY_SUMMARY_CHAPTERS;
}

export async function saveSummaryChapters(
  videoStorageKey: string,
  payload: ShareSummaryChapters
): Promise<void> {
  await putObjectJson(
    summaryChaptersKeyFor(videoStorageKey),
    hydrateSummaryChapters(payload)
  );
}
