export type UploadSample = {
  atMs: number;
  recordedBytes: number;
  uploadedBytes: number;
};

export type BitrateGovernorOptions = {
  // The preset's screen bitrate, which the recording never goes above.
  ceiling: number;
  floor?: number;
  minChangeMs?: number;
  raiseAfterMs?: number;
};

export type BitrateGovernor = {
  readonly bitrate: number;
  // The new screen bitrate when this sample calls for one.
  sample(s: UploadSample): number | null;
};

const FLOOR = 500_000;
const MIN_CHANGE_MS = 10_000;
const RAISE_AFTER_MS = 30_000;
const HIGH_WATER_BYTES = 1024 * 1024;
const HIGH_WATER_SECONDS = 6;
const LOW_WATER_BYTES = 256 * 1024;
const LOW_WATER_SECONDS = 3;
const HEADROOM = 0.85;
const RAISE = 1.25;

/*
 * Keeps the upload caught up with the recording, so stopping leaves seconds
 * to send rather than minutes. A backlog that keeps growing means the
 * connection is slower than the recording: the bitrate drops toward what
 * the upload actually moves. Once it has kept up for a while the bitrate
 * climbs back toward the preset. Changes are spaced out because each one
 * costs the encoder a keyframe.
 */
export function createBitrateGovernor(
  options: BitrateGovernorOptions,
): BitrateGovernor {
  const {
    ceiling,
    floor = Math.min(ceiling, FLOOR),
    minChangeMs = MIN_CHANGE_MS,
    raiseAfterMs = RAISE_AFTER_MS,
  } = options;
  let bitrate = ceiling;
  let prev: UploadSample | null = null;
  let lastChangeMs = -Infinity;
  let caughtUpSince: number | null = null;

  function change(next: number, atMs: number): number | null {
    const clamped = Math.round(Math.min(ceiling, Math.max(floor, next)));
    if (clamped === bitrate) return null;
    bitrate = clamped;
    lastChangeMs = atMs;
    return bitrate;
  }

  return {
    get bitrate() {
      return bitrate;
    },
    sample(s) {
      const last = prev;
      prev = s;
      if (!last || s.atMs <= last.atMs) return null;
      const seconds = (s.atMs - last.atMs) / 1000;
      const inRate = (s.recordedBytes - last.recordedBytes) / seconds;
      const outRate = (s.uploadedBytes - last.uploadedBytes) / seconds;
      if (inRate <= 0) return null;

      const backlog = s.recordedBytes - s.uploadedBytes;
      const canChange = s.atMs - lastChangeMs >= minChangeMs;
      if (backlog > Math.max(HIGH_WATER_BYTES, inRate * HIGH_WATER_SECONDS)) {
        caughtUpSince = null;
        if (!canChange || outRate >= inRate / HEADROOM) return null;
        const scale = Math.min(
          0.9,
          Math.max(0.5, (HEADROOM * outRate) / inRate),
        );
        return change(bitrate * scale, s.atMs);
      }
      if (backlog > Math.max(LOW_WATER_BYTES, inRate * LOW_WATER_SECONDS)) {
        caughtUpSince = null;
        return null;
      }
      caughtUpSince ??= s.atMs;
      if (bitrate >= ceiling || !canChange) return null;
      if (s.atMs - caughtUpSince < raiseAfterMs) return null;
      caughtUpSince = s.atMs;
      return change(bitrate * RAISE, s.atMs);
    },
  };
}

export type BitrateGovernorLoop = BitrateGovernorOptions & {
  read(): { recordedBytes: number; uploadedBytes: number };
  apply(bitrate: number): void;
  intervalMs?: number;
  now?: () => number;
  every?: (ms: number, cb: () => void) => () => void;
};

// Samples the upload on a timer; the returned function stops it.
export function startBitrateGovernor(loop: BitrateGovernorLoop): () => void {
  const governor = createBitrateGovernor(loop);
  const now = loop.now ?? Date.now;
  const every =
    loop.every ??
    ((ms: number, cb: () => void) => {
      const timer = setInterval(cb, ms);
      return () => clearInterval(timer);
    });
  return every(loop.intervalMs ?? 5000, () => {
    const next = governor.sample({ atMs: now(), ...loop.read() });
    if (next !== null) loop.apply(next);
  });
}
