/*
 * Spans of the recording the player skips at playback time, in recording
 * milliseconds. The MP4 is untouched; downloads and og:video keep the full
 * clip. Cuts are stored normalized: sorted, merged, non-empty.
 */
export type RecordingCut = { startMs: number; endMs: number };

const MAX_CUTS = 500;

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
