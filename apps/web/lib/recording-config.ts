const MP4 = ".mp4";

export function recordingConfigKeyFor(storageKey: string): string {
  if (storageKey.endsWith(MP4)) {
    return `${storageKey.slice(0, -MP4.length)}.config.json`;
  }
  return `${storageKey}.config.json`;
}

export type RecordingCameraCorner =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

export type RecordingCameraSize = "small" | "medium" | "large";

// `background` is a gradient preset key, a '#hex' fill, or 'transparent'.
export type RecordingConfig = {
  background: string;
  cameraCorner: RecordingCameraCorner;
  cameraSize: RecordingCameraSize;
  micMuted: boolean;
  systemMuted: boolean;
};

export const DEFAULT_RECORDING_CONFIG: RecordingConfig = {
  background: "transparent",
  cameraCorner: "bottom-right",
  cameraSize: "medium",
  micMuted: false,
  systemMuted: false,
};

export const RECORDING_GRADIENT_KEYS = [
  "violet",
  "sunset",
  "orchid",
  "forest",
  "flamingo",
  "citrus",
  "arctic",
  "ocean",
  "deep",
] as const;
export type RecordingGradientKey = (typeof RECORDING_GRADIENT_KEYS)[number];

export const RECORDING_GRADIENT_PRESETS: Record<
  RecordingGradientKey,
  { label: string; stops: { offset: number; color: string }[] }
> = {
  violet: {
    label: "Violet",
    stops: [
      { offset: 0, color: "#6366f1" },
      { offset: 0.5, color: "#a855f7" },
      { offset: 1, color: "#e9d5ff" },
    ],
  },
  sunset: {
    label: "Sunset",
    stops: [
      { offset: 0, color: "#fcd5b5" },
      { offset: 0.55, color: "#f5946a" },
      { offset: 1, color: "#a47bd6" },
    ],
  },
  orchid: {
    label: "Orchid",
    stops: [
      { offset: 0, color: "#7c3aed" },
      { offset: 0.5, color: "#ec4899" },
      { offset: 1, color: "#fb923c" },
    ],
  },
  forest: {
    label: "Forest",
    stops: [
      { offset: 0, color: "#022c22" },
      { offset: 0.5, color: "#15803d" },
      { offset: 1, color: "#86efac" },
    ],
  },
  flamingo: {
    label: "Flamingo",
    stops: [
      { offset: 0, color: "#9d174d" },
      { offset: 0.5, color: "#db2777" },
      { offset: 1, color: "#fbcfe8" },
    ],
  },
  citrus: {
    label: "Citrus",
    stops: [
      { offset: 0, color: "#f59e0b" },
      { offset: 0.4, color: "#ec4899" },
      { offset: 0.8, color: "#3b82f6" },
      { offset: 1, color: "#1e3a8a" },
    ],
  },
  arctic: {
    label: "Arctic",
    stops: [
      { offset: 0, color: "#0ea5e9" },
      { offset: 0.5, color: "#a5f3fc" },
      { offset: 1, color: "#e0f2fe" },
    ],
  },
  ocean: {
    label: "Ocean",
    stops: [
      { offset: 0, color: "#0c4a6e" },
      { offset: 0.5, color: "#0e7490" },
      { offset: 1, color: "#67e8f9" },
    ],
  },
  deep: {
    label: "Deep",
    stops: [
      { offset: 0, color: "#312e81" },
      { offset: 0.55, color: "#7c3aed" },
      { offset: 1, color: "#f472b6" },
    ],
  },
};

export function isRecordingGradientKey(v: string): v is RecordingGradientKey {
  return (RECORDING_GRADIENT_KEYS as readonly string[]).includes(v);
}

export function isRecordingHexColor(v: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);
}

export function recordingGradientCss(
  stops: { offset: number; color: string }[],
): string {
  const parts = stops.map((s) => `${s.color} ${s.offset * 100}%`);
  return `linear-gradient(135deg, ${parts.join(", ")})`;
}

export function hydrateRecordingConfig(raw: unknown): RecordingConfig {
  if (!raw || typeof raw !== "object") return DEFAULT_RECORDING_CONFIG;
  const obj = raw as Record<string, unknown>;
  const bg =
    typeof obj.background === "string" &&
    (obj.background === "transparent" ||
      isRecordingGradientKey(obj.background) ||
      isRecordingHexColor(obj.background))
      ? obj.background
      : DEFAULT_RECORDING_CONFIG.background;
  const corner = ((): RecordingCameraCorner => {
    const v = obj.cameraCorner;
    if (
      v === "bottom-right" ||
      v === "bottom-left" ||
      v === "top-right" ||
      v === "top-left"
    ) {
      return v;
    }
    return DEFAULT_RECORDING_CONFIG.cameraCorner;
  })();
  const size = ((): RecordingCameraSize => {
    const v = obj.cameraSize;
    if (v === "small" || v === "medium" || v === "large") return v;
    return DEFAULT_RECORDING_CONFIG.cameraSize;
  })();
  return {
    background: bg,
    cameraCorner: corner,
    cameraSize: size,
    micMuted: obj.micMuted === true,
    systemMuted: obj.systemMuted === true,
  };
}
