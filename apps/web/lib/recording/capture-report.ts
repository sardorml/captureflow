import type {
  CaptureAudio,
  CaptureDevice,
  CaptureReport,
  RecordingStream,
} from "./types";

const MAX_TEXT = 200;
const MAX_WARNINGS = 20;

function text(raw: unknown): string | undefined {
  return typeof raw === "string" && raw.length > 0
    ? raw.slice(0, MAX_TEXT)
    : undefined;
}

function count(raw: unknown): number | undefined {
  return typeof raw === "number" && Number.isFinite(raw) && raw >= 0
    ? Math.round(raw)
    : undefined;
}

function record(raw: unknown): Record<string, unknown> | null {
  return raw !== null && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : null;
}

function hydrateDevice(raw: unknown): CaptureDevice | null {
  const r = record(raw);
  if (!r) return null;
  if (typeof r.requested !== "boolean" || typeof r.acquired !== "boolean")
    return null;
  const device: CaptureDevice = {
    requested: r.requested,
    acquired: r.acquired,
  };
  const deviceId = text(r.deviceId);
  if (deviceId) device.deviceId = deviceId;
  const label = text(r.label);
  if (label) device.label = label;
  const sampleRate = count(r.sampleRate);
  if (sampleRate !== undefined) device.sampleRate = sampleRate;
  const channelCount = count(r.channelCount);
  if (channelCount !== undefined) device.channelCount = channelCount;
  return device;
}

function hydrateAudio(raw: unknown): CaptureAudio | null {
  const r = record(raw);
  if (!r) return null;
  if (r.muxed === "webcam") return { muxed: "webcam" };
  if (r.muxed === "none")
    return { muxed: "none", reason: text(r.reason) ?? "unknown" };
  if (r.muxed === "aac" || r.muxed === "opus") {
    const sampleRate = count(r.sampleRate);
    const channelCount = count(r.channelCount);
    const bitrate = count(r.bitrate);
    if (
      sampleRate === undefined ||
      channelCount === undefined ||
      bitrate === undefined
    )
      return null;
    return { muxed: r.muxed, sampleRate, channelCount, bitrate };
  }
  return null;
}

export function hydrateCaptureReport(raw: unknown): CaptureReport | null {
  const r = record(raw);
  if (!r) return null;
  const camera = hydrateDevice(r.camera);
  const mic = hydrateDevice(r.mic);
  const audio = hydrateAudio(r.audio);
  if (!camera || !mic || !audio) return null;
  const warnings = Array.isArray(r.warnings)
    ? r.warnings
        .map(text)
        .filter((w): w is string => w !== undefined)
        .slice(0, MAX_WARNINGS)
    : [];
  return {
    userAgent: text(r.userAgent) ?? "",
    surface: text(r.surface) ?? null,
    camera,
    mic,
    audio,
    warnings,
  };
}

export function parseCaptureJson(
  captureJson: string | null,
): CaptureReport | null {
  if (!captureJson) return null;
  try {
    return hydrateCaptureReport(JSON.parse(captureJson));
  } catch {
    return null;
  }
}

// Whether the recorder put any audio in the file, so nobody reads a silent
// file to find out. Unknown without a report.
export function trackHasAudio(
  capture: CaptureReport | null,
  track: RecordingStream,
): boolean | null {
  if (!capture) return null;
  const { muxed } = capture.audio;
  return track === "webcam"
    ? muxed === "webcam"
    : muxed === "aac" || muxed === "opus";
}
