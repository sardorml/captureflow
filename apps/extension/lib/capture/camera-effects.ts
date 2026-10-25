export type CameraBackground =
  | { kind: "none" }
  | { kind: "blur" }
  | { kind: "color"; color: string }
  | { kind: "gradient"; from: string; to: string };

export const CAMERA_BACKGROUNDS = {
  none: { label: "None", kind: "none" },
  blur: { label: "Blur", kind: "blur" },
  ocean: { label: "Ocean", kind: "gradient", from: "#2f80ed", to: "#56ccf2" },
  berry: { label: "Berry", kind: "gradient", from: "#e4568f", to: "#9b5de5" },
  sunset: { label: "Sunset", kind: "gradient", from: "#ff8a65", to: "#f6c453" },
  mint: { label: "Mint", kind: "gradient", from: "#5ddcb2", to: "#3ab0c8" },
  mist: { label: "Mist", kind: "color", color: "#dbe7ff" },
  royal: { label: "Royal", kind: "color", color: "#2563eb" },
  blush: { label: "Blush", kind: "color", color: "#f9d5d3" },
  brick: { label: "Brick", kind: "color", color: "#c2410c" },
  pine: { label: "Pine", kind: "color", color: "#2f7d5a" },
  ink: { label: "Ink", kind: "color", color: "#1f2937" },
  lavender: { label: "Lavender", kind: "color", color: "#c7c4f7" },
  violet: { label: "Violet", kind: "color", color: "#6d5cf6" },
  butter: { label: "Butter", kind: "color", color: "#fde68a" },
  amber: { label: "Amber", kind: "color", color: "#f5a524" },
  stone: { label: "Stone", kind: "color", color: "#9ca3af" },
} as const satisfies Record<string, { label: string } & CameraBackground>;

export type CameraBackgroundId = keyof typeof CAMERA_BACKGROUNDS;

export const CAMERA_BACKGROUND_IDS = Object.keys(
  CAMERA_BACKGROUNDS,
) as CameraBackgroundId[];

// ctx.filter strings, so the same look applies in the preview and the file.
export const CAMERA_FILTERS = {
  none: { label: "None", css: "" },
  warm: { label: "Warm", css: "sepia(0.25) saturate(1.2)" },
  cool: {
    label: "Cool",
    css: "hue-rotate(-12deg) saturate(1.1) brightness(1.03)",
  },
  vivid: { label: "Vivid", css: "saturate(1.5) contrast(1.05)" },
  soft: { label: "Soft", css: "brightness(1.08) contrast(0.92) saturate(0.9)" },
  mono: { label: "Mono", css: "grayscale(1)" },
} as const satisfies Record<string, { label: string; css: string }>;

export type CameraFilterId = keyof typeof CAMERA_FILTERS;

export const CAMERA_FILTER_IDS = Object.keys(
  CAMERA_FILTERS,
) as CameraFilterId[];

export type CameraEffect = {
  background: CameraBackgroundId;
  filter: CameraFilterId;
};

export const DEFAULT_CAMERA_EFFECT: CameraEffect = {
  background: "none",
  filter: "none",
};

export function isCameraBackgroundId(v: unknown): v is CameraBackgroundId {
  return typeof v === "string" && v in CAMERA_BACKGROUNDS;
}

export function isCameraFilterId(v: unknown): v is CameraFilterId {
  return typeof v === "string" && v in CAMERA_FILTERS;
}

export function hydrateCameraEffect(raw: unknown): CameraEffect {
  if (!raw || typeof raw !== "object") return DEFAULT_CAMERA_EFFECT;
  const r = raw as Record<string, unknown>;
  return {
    background: isCameraBackgroundId(r.background) ? r.background : "none",
    filter: isCameraFilterId(r.filter) ? r.filter : "none",
  };
}

// A plain effect needs no processing, so the raw camera track is used as is.
export function isPlainCameraEffect(effect: CameraEffect): boolean {
  return effect.background === "none" && effect.filter === "none";
}

export function cameraBackgroundCss(id: CameraBackgroundId): string {
  const bg = CAMERA_BACKGROUNDS[id];
  switch (bg.kind) {
    case "color":
      return bg.color;
    case "gradient":
      return `linear-gradient(135deg, ${bg.from}, ${bg.to})`;
    default:
      return "";
  }
}
