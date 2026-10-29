import {
  RECORDING_QUALITIES,
  peakBitsPerSecond,
  type RecordingQualityId,
} from "./quality";

export type UploadSpeed = { bitsPerSecond: number; measuredAt: number };

// A reading this old may be from another network.
const STALE_MS = 7 * 24 * 60 * 60 * 1000;
// Room the connection needs beside the recording: the mic chunks, other tabs.
const HEADROOM = 0.85;

// Halfway toward each new reading, so one bad connection moves it but doesn't define it.
export function blendUploadSpeed(
  prev: UploadSpeed | null,
  measured: number,
  now: number,
): UploadSpeed {
  const fresh = prev && now - prev.measuredAt < STALE_MS ? prev : null;
  return {
    bitsPerSecond: Math.round(
      fresh ? (fresh.bitsPerSecond + measured) / 2 : measured,
    ),
    measuredAt: now,
  };
}

// Whether this preset sends faster than the last measured upload carries.
export function outpacesUpload(
  quality: RecordingQualityId,
  camera: boolean,
  speed: UploadSpeed | null,
  now: number,
): boolean {
  if (!speed || now - speed.measuredAt >= STALE_MS) return false;
  return (
    peakBitsPerSecond(RECORDING_QUALITIES[quality], camera) >
    speed.bitsPerSecond * HEADROOM
  );
}
