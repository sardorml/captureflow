/*
 * The stored capture report (apps/web/lib/recording/capture-report.ts) as
 * lines for the admin's recordings table. Read leniently: a row is never
 * hidden over a report the admin can't parse.
 */
export type CaptureSummary = {
  mic: string;
  camera: string;
  warnings: string[];
};

type Device = { requested?: unknown; acquired?: unknown; label?: unknown };

function device(raw: unknown): Device {
  return raw !== null && typeof raw === "object" ? (raw as Device) : {};
}

function deviceLine(name: string, d: Device): string {
  if (d.requested !== true) return `${name} off`;
  if (d.acquired !== true) return `${name} not acquired`;
  return typeof d.label === "string" && d.label
    ? `${name}: ${d.label}`
    : `${name}: default device`;
}

function audioLine(raw: unknown): string | null {
  const a =
    raw !== null && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : null;
  if (!a) return null;
  if (a.muxed === "aac" || a.muxed === "opus") {
    const codec = a.muxed === "opus" ? "Opus" : "AAC";
    return typeof a.sampleRate === "number"
      ? `${codec} ${Math.round(a.sampleRate / 1000)} kHz`
      : codec;
  }
  if (a.muxed === "webcam") return "in the camera track";
  if (a.muxed === "none")
    return typeof a.reason === "string"
      ? `no audio track: ${a.reason}`
      : "no audio track";
  return null;
}

export function summarizeCapture(
  captureJson: string | null,
): CaptureSummary | null {
  if (!captureJson) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(captureJson);
  } catch {
    return null;
  }
  if (parsed === null || typeof parsed !== "object") return null;
  const r = parsed as Record<string, unknown>;
  const mic = device(r.mic);
  const audio = audioLine(r.audio);
  const micLine = deviceLine("Mic", mic);
  return {
    mic: mic.requested === true && audio ? `${micLine} · ${audio}` : micLine,
    camera: deviceLine("Camera", device(r.camera)),
    warnings: Array.isArray(r.warnings)
      ? r.warnings.filter((w): w is string => typeof w === "string")
      : [],
  };
}
