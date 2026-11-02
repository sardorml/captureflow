/*
 * Spans of the recording the player skips at playback time, in recording
 * milliseconds. The MP4 is untouched; downloads and og:video keep the full
 * clip. Cuts are stored normalized: sorted, merged, non-empty.
 */
export type RecordingCut = { startMs: number; endMs: number };

const MAX_CUTS = 500;
const MIN_CLIP_MS = 200;
const HOP_SLACK_MS = 300;

export function normalizeCuts(
  raw: unknown,
  durationMs?: number | null,
): RecordingCut[] {
  if (!Array.isArray(raw)) return [];
  const limit =
    typeof durationMs === "number" &&
    Number.isFinite(durationMs) &&
    durationMs > 0
      ? durationMs
      : Number.POSITIVE_INFINITY;
  const spans: RecordingCut[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const { startMs, endMs } = item as Record<string, unknown>;
    if (typeof startMs !== "number" || typeof endMs !== "number") continue;
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) continue;
    const start = Math.max(0, Math.round(startMs));
    const end = Math.min(limit, Math.round(endMs));
    if (end <= start) continue;
    spans.push({ startMs: start, endMs: end });
  }
  spans.sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs);
  const merged: RecordingCut[] = [];
  for (const span of spans) {
    const last = merged[merged.length - 1];
    if (last && span.startMs <= last.endMs) {
      last.endMs = Math.max(last.endMs, span.endMs);
    } else {
      merged.push({ ...span });
    }
  }
  return merged.slice(0, MAX_CUTS);
}

export function findCutAt(
  ms: number,
  cuts: readonly RecordingCut[],
): RecordingCut | null {
  return cuts.find((cut) => ms >= cut.startMs && ms < cut.endMs) ?? null;
}

export function isInsideCut(
  ms: number,
  cuts: readonly RecordingCut[],
): boolean {
  return findCutAt(ms, cuts) !== null;
}

export function snapOutOfCuts(
  ms: number,
  cuts: readonly RecordingCut[],
): number {
  return findCutAt(ms, cuts)?.endMs ?? ms;
}

// The first cut whose end is still ahead of `ms`: the one playback meets next.
export function nextCutFrom(
  ms: number,
  cuts: readonly RecordingCut[],
): RecordingCut | null {
  return cuts.find((cut) => cut.endMs > ms) ?? null;
}

/*
 * The edited timeline is the recording with the cuts removed. `toEditedMs`
 * maps a recording time onto it (a time inside a cut lands where the cut
 * closes up) and `toSourceMs` is its inverse, landing on the cut's end.
 */
export function toEditedMs(
  sourceMs: number,
  cuts: readonly RecordingCut[],
): number {
  let removed = 0;
  for (const cut of cuts) {
    if (cut.startMs >= sourceMs) break;
    removed += Math.min(sourceMs, cut.endMs) - cut.startMs;
  }
  return sourceMs - removed;
}

export function toSourceMs(
  editedMs: number,
  cuts: readonly RecordingCut[],
): number {
  let source = editedMs;
  for (const cut of cuts) {
    if (cut.startMs > source) break;
    source += cut.endMs - cut.startMs;
  }
  return source;
}

export function effectiveDurationMs(
  durationMs: number,
  cuts: readonly RecordingCut[],
): number {
  return toEditedMs(durationMs, cuts);
}

// Whether a move from `fromMs` to `toMs` is playback hopping a cut: it left at
// the cut's start, or from inside it, and landed at its end, unlike a seek that
// just crosses it.
export function isCutHop(
  fromMs: number,
  toMs: number,
  cuts: readonly RecordingCut[],
): boolean {
  return cuts.some(
    (cut) =>
      fromMs >= cut.startMs - HOP_SLACK_MS &&
      fromMs < cut.endMs - HOP_SLACK_MS &&
      Math.abs(toMs - cut.endMs) <= HOP_SLACK_MS,
  );
}

// What the timeline draws as clips: the recording minus its cuts, divided at
// each split.
export function timelineClips(
  durationMs: number,
  cuts: readonly RecordingCut[],
  splitsMs: readonly number[],
): RecordingCut[] {
  if (durationMs <= 0) return [];
  const clips: RecordingCut[] = [];
  let start = 0;
  for (const cut of [...cuts, { startMs: durationMs, endMs: durationMs }]) {
    const end = Math.min(cut.startMs, durationMs);
    let from = start;
    for (const split of [...splitsMs].sort((a, b) => a - b)) {
      if (split <= from || split >= end) continue;
      clips.push({ startMs: from, endMs: split });
      from = split;
    }
    if (end > from) clips.push({ startMs: from, endMs: end });
    start = Math.max(start, cut.endMs);
  }
  return clips;
}

// Drags one edge of a clip to `toMs`: inward cuts away what it leaves behind,
// outward takes back the gap beside it, and it stops at the clip's neighbour.
export function trimClip(
  cuts: readonly RecordingCut[],
  clip: RecordingCut,
  edge: "start" | "end",
  toMs: number,
): RecordingCut[] {
  const target = Math.round(toMs);
  if (edge === "end") {
    const limit =
      cuts.find((cut) => cut.startMs === clip.endMs)?.endMs ?? clip.endMs;
    const to = Math.min(limit, Math.max(clip.startMs + MIN_CLIP_MS, target));
    return to < clip.endMs
      ? addCut(cuts, { startMs: to, endMs: clip.endMs })
      : removeCut(cuts, { startMs: clip.endMs, endMs: to });
  }
  const limit =
    cuts.find((cut) => cut.endMs === clip.startMs)?.startMs ?? clip.startMs;
  const to = Math.max(limit, Math.min(clip.endMs - MIN_CLIP_MS, target));
  return to > clip.startMs
    ? addCut(cuts, { startMs: clip.startMs, endMs: to })
    : removeCut(cuts, { startMs: to, endMs: clip.startMs });
}

export function addCut(
  cuts: readonly RecordingCut[],
  cut: RecordingCut,
): RecordingCut[] {
  return normalizeCuts([...cuts, cut]);
}

// Restores `span`: cuts overlapping it are trimmed or split around it.
export function removeCut(
  cuts: readonly RecordingCut[],
  span: RecordingCut,
): RecordingCut[] {
  const out: RecordingCut[] = [];
  for (const cut of cuts) {
    if (cut.endMs <= span.startMs || cut.startMs >= span.endMs) {
      out.push(cut);
      continue;
    }
    if (cut.startMs < span.startMs) {
      out.push({ startMs: cut.startMs, endMs: span.startMs });
    }
    if (cut.endMs > span.endMs) {
      out.push({ startMs: span.endMs, endMs: cut.endMs });
    }
  }
  return out;
}

export function cutsEqual(
  a: readonly RecordingCut[],
  b: readonly RecordingCut[],
): boolean {
  return (
    a.length === b.length &&
    a.every(
      (cut, i) => cut.startMs === b[i]?.startMs && cut.endMs === b[i]?.endMs,
    )
  );
}
