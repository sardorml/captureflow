export type CaptionSize = "small" | "medium" | "large";

export type CaptionPosition = "top" | "bottom";

// How a watcher likes captions drawn, kept in their browser rather than on
// the recording, so it follows them across every player.
export type CaptionPrefs = { size: CaptionSize; position: CaptionPosition };

export const DEFAULT_CAPTION_PREFS: CaptionPrefs = {
  size: "medium",
  position: "bottom",
};

export const CAPTION_PREFS_STORAGE_KEY = "captureflow:captions";

export const CAPTION_SIZES: { value: CaptionSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

export const CAPTION_POSITIONS: { value: CaptionPosition; label: string }[] = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
];

export function hydrateCaptionPrefs(raw: unknown): CaptionPrefs {
  if (!raw || typeof raw !== "object") return DEFAULT_CAPTION_PREFS;
  const { size, position } = raw as Record<string, unknown>;
  return {
    size:
      size === "small" || size === "medium" || size === "large"
        ? size
        : DEFAULT_CAPTION_PREFS.size,
    position: position === "top" ? "top" : DEFAULT_CAPTION_PREFS.position,
  };
}

export function parseCaptionPrefs(json: string | null): CaptionPrefs {
  if (!json) return DEFAULT_CAPTION_PREFS;
  try {
    return hydrateCaptionPrefs(JSON.parse(json));
  } catch {
    return DEFAULT_CAPTION_PREFS;
  }
}
