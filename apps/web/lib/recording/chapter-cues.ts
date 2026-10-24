import type { RecordingCut } from "./cuts";
import type { RecordingChapter } from "./summary-chapters";

export type ChapterCue = {
  id: string;
  startMs: number;
  endMs: number;
  title: string;
};

export const SELECTION_CUE_ID = "selection";

// The last chapter runs to a day; Video.js clamps cues to the media
// duration, which the recording row only knows approximately.
const OPEN_END_MS = 86_400_000;

// Each chapter runs to the next one; two chapters at the same time keep the
// first.
export function chapterCues(
  chapters: readonly RecordingChapter[],
  durationMs: number | null,
): ChapterCue[] {
  const limit = durationMs != null && durationMs > 0 ? durationMs : OPEN_END_MS;
  const sorted = [...chapters]
    .filter((c) => Number.isFinite(c.ms) && c.ms >= 0 && c.ms < limit)
    .sort((a, b) => a.ms - b.ms);
  const cues: ChapterCue[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const chapter = sorted[i]!;
    const next = sorted.slice(i + 1).find((c) => c.ms > chapter.ms);
    const endMs = next ? next.ms : OPEN_END_MS;
    if (cues.length > 0 && cues[cues.length - 1]!.startMs === chapter.ms) {
      continue;
    }
    cues.push({
      id: chapter.id,
      startMs: chapter.ms,
      endMs,
      title: chapter.title,
    });
  }
  return cues;
}

export function selectionCue(selection: RecordingCut): ChapterCue {
  return {
    id: SELECTION_CUE_ID,
    startMs: selection.startMs,
    endMs: selection.endMs,
    title: "Selection",
  };
}

export function cuesToVtt(cues: readonly ChapterCue[]): string {
  const body = cues
    .map(
      (cue) =>
        `${cue.id}\n${stamp(cue.startMs)} --> ${stamp(cue.endMs)}\n${cue.title.replace(/\s*\n\s*/g, " ")}\n`,
    )
    .join("\n");
  return `WEBVTT\n\n${body}`;
}

export function cuesToTrackUrl(cues: readonly ChapterCue[]): string {
  return `data:text/vtt;charset=utf-8,${encodeURIComponent(cuesToVtt(cues))}`;
}

function stamp(ms: number): string {
  const total = Math.max(0, Math.round(ms));
  const h = Math.floor(total / 3_600_000);
  const m = Math.floor(total / 60_000) % 60;
  const s = Math.floor(total / 1_000) % 60;
  const pad = (n: number, w: number): string => String(n).padStart(w, "0");
  return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}.${pad(total % 1_000, 3)}`;
}
