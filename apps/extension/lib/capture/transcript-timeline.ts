import type {
  RecordingTranscript,
  TranscriptSegment,
  TranscriptSource,
} from "../api/types";

/*
 * One recognized phrase, stamped in epoch milliseconds from when its results
 * arrived: Chrome's recognizer does not report audio timestamps yet, so the
 * first interim result stands in for the start and the final result for the
 * end.
 */
export type Utterance = {
  firstInterimAt: number;
  finalAt: number;
  text: string;
};

export type SegmentClock = {
  pause(at: number): void;
  resume(at: number): void;
  // Epoch → recording time, with paused stretches removed.
  toRecordingMs(epochMs: number): number;
  isPausedAt(epochMs: number): boolean;
};

type Pause = { from: number; to: number | null };

export function createSegmentClock({
  startedAt,
}: {
  startedAt: number;
}): SegmentClock {
  const pauses: Pause[] = [];
  const open = (): Pause | null => {
    const last = pauses[pauses.length - 1];
    return last && last.to === null ? last : null;
  };
  return {
    pause(at) {
      if (open()) return;
      pauses.push({ from: at, to: null });
    },
    resume(at) {
      const current = open();
      if (current) current.to = Math.max(at, current.from);
    },
    toRecordingMs(epochMs) {
      let removed = 0;
      for (const pause of pauses) {
        if (epochMs <= pause.from) break;
        const to = pause.to ?? Number.POSITIVE_INFINITY;
        removed += Math.min(epochMs, to) - pause.from;
      }
      return Math.max(0, epochMs - startedAt - removed);
    },
    isPausedAt(epochMs) {
      return pauses.some(
        (pause) =>
          epochMs >= pause.from && (pause.to === null || epochMs < pause.to),
      );
    },
  };
}

// Speech starts before the first interim result and ends before the final
// one; these pull the segment edges back toward the audio.
const START_LEAD_MS = 400;
const END_LAG_MS = 300;
const MIN_SEGMENT_MS = 300;

type BuildOptions = {
  clock: SegmentClock;
  durationMs: number;
  source: TranscriptSource;
  language: string | null;
};

export function buildTranscript(
  utterances: readonly Utterance[],
  { clock, durationMs, source, language }: BuildOptions,
): RecordingTranscript | null {
  const segments: TranscriptSegment[] = [];
  for (const utterance of utterances) {
    const text = utterance.text.replace(/\s+/g, " ").trim();
    if (!text) continue;
    if (
      clock.isPausedAt(utterance.firstInterimAt) &&
      clock.isPausedAt(utterance.finalAt) &&
      clock.toRecordingMs(utterance.firstInterimAt) ===
        clock.toRecordingMs(utterance.finalAt)
    ) {
      continue;
    }
    const startMs = Math.max(
      0,
      clock.toRecordingMs(utterance.firstInterimAt) - START_LEAD_MS,
    );
    const endMs = Math.min(
      durationMs,
      Math.max(
        clock.toRecordingMs(utterance.finalAt) - END_LAG_MS,
        startMs + MIN_SEGMENT_MS,
      ),
    );
    if (endMs <= startMs) continue;
    segments.push({ id: `s${segments.length + 1}`, startMs, endMs, text });
  }
  if (segments.length === 0) return null;
  segments.sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs);
  return { version: 1, language, source, segments };
}
