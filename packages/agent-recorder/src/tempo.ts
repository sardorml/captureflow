export type TempoRamp = { rampFromMs: number; rampToMs: number };

export const TEMPO_RATIO = 4;
const WARP_STEP_MS = 10;

// Level until the ramp, a smooth rise to four times the speed, then level again.
export function tempoAt(ms: number, ramp: TempoRamp): number {
  const span = Math.max(1, ramp.rampToMs - ramp.rampFromMs);
  const p = Math.min(1, Math.max(0, (ms - ramp.rampFromMs) / span));
  const s = p * p * (3 - 2 * p);
  return Math.pow(TEMPO_RATIO, s);
}

/*
 * Moments laid out evenly between `from` and `to` are moved so that an even
 * amount of music passes between any two of them: what happens while the
 * music is slow takes longer, what happens once it's fast goes by quickly.
 */
export function tempoWarp(
  from: number,
  to: number,
  ramp: TempoRamp,
): (ms: number) => number {
  const steps = Math.max(1, Math.ceil((to - from) / WARP_STEP_MS));
  const passed: number[] = [0];
  for (let i = 1; i <= steps; i++) {
    const at = from + (i - 0.5) * ((to - from) / steps);
    passed.push(passed[i - 1]! + tempoAt(at, ramp));
  }
  const total = passed[steps]!;
  return (ms) => {
    if (ms <= from) return ms;
    if (ms >= to) return ms;
    const want = ((ms - from) / (to - from)) * total;
    let lo = 0;
    let hi = steps;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (passed[mid]! < want) lo = mid;
      else hi = mid;
    }
    const f = (want - passed[lo]!) / Math.max(1e-9, passed[hi]! - passed[lo]!);
    return from + ((lo + f) / steps) * (to - from);
  };
}
