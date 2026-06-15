// Share-config sidecar — parallel to lib/snap-keys.ts. The screen MP4
// is uploaded once by the desktop and never re-encoded; bg, camera PiP
// placement, and per-track mute state are applied at play time on top
// of the immutable bytes. We persist that config as a JSON sidecar
// next to the video in R2 so both the public viewer and the dashboard
// edit page read the same source of truth (no D1 migration needed for
// what is effectively a presentation-layer dictionary).

const MP4 = '.mp4';

export function shareConfigKeyFor(storageKey: string): string {
  if (storageKey.endsWith(MP4)) {
    return `${storageKey.slice(0, -MP4.length)}.config.json`;
  }
  return `${storageKey}.config.json`;
}

export type ShareCameraCorner =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left';

export type ShareCameraSize = 'small' | 'medium' | 'large';

// Stored on disk as a tiny JSON blob. Anything unknown narrows to a
// safe default at hydrate time so a corrupted sidecar can't crash the
// viewer. `background` follows the snap-editor convention: a gradient
// preset key, a '#hex' fill, or 'transparent'.
export type ShareConfig = {
  background: string;
  cameraCorner: ShareCameraCorner;
  cameraSize: ShareCameraSize;
  micMuted: boolean;
  systemMuted: boolean;
};

export const DEFAULT_SHARE_CONFIG: ShareConfig = {
  background: 'transparent',
  cameraCorner: 'bottom-right',
  cameraSize: 'medium',
  micMuted: false,
  systemMuted: false,
};

export const SHARE_GRADIENT_KEYS = [
  'violet',
  'sunset',
  'orchid',
  'forest',
  'flamingo',
  'citrus',
  'arctic',
  'ocean',
  'deep',
] as const;
export type ShareGradientKey = (typeof SHARE_GRADIENT_KEYS)[number];

// Same gradients the snap editor ships — kept in sync so a user's
// mental model carries between snap edits and share edits. Stops are
// CSS-friendly: each tuple `(offset%, color)` is rendered into a
// `linear-gradient(135deg, …)` by `shareGradientCss`.
export const SHARE_GRADIENT_PRESETS: Record<
  ShareGradientKey,
  { label: string; stops: { offset: number; color: string }[] }
> = {
  violet: {
    label: 'Violet',
    stops: [
      { offset: 0, color: '#6366f1' },
      { offset: 0.5, color: '#a855f7' },
      { offset: 1, color: '#e9d5ff' },
    ],
  },
  sunset: {
    label: 'Sunset',
    stops: [
      { offset: 0, color: '#fcd5b5' },
      { offset: 0.55, color: '#f5946a' },
      { offset: 1, color: '#a47bd6' },
    ],
  },
  orchid: {
    label: 'Orchid',
    stops: [
      { offset: 0, color: '#7c3aed' },
      { offset: 0.5, color: '#ec4899' },
      { offset: 1, color: '#fb923c' },
    ],
  },
  forest: {
    label: 'Forest',
    stops: [
      { offset: 0, color: '#022c22' },
      { offset: 0.5, color: '#15803d' },
      { offset: 1, color: '#86efac' },
    ],
  },
  flamingo: {
    label: 'Flamingo',
    stops: [
      { offset: 0, color: '#9d174d' },
      { offset: 0.5, color: '#db2777' },
      { offset: 1, color: '#fbcfe8' },
    ],
  },
  citrus: {
    label: 'Citrus',
    stops: [
      { offset: 0, color: '#f59e0b' },
      { offset: 0.4, color: '#ec4899' },
      { offset: 0.8, color: '#3b82f6' },
      { offset: 1, color: '#1e3a8a' },
    ],
  },
  arctic: {
    label: 'Arctic',
    stops: [
      { offset: 0, color: '#0ea5e9' },
      { offset: 0.5, color: '#a5f3fc' },
      { offset: 1, color: '#e0f2fe' },
    ],
  },
  ocean: {
    label: 'Ocean',
    stops: [
      { offset: 0, color: '#0c4a6e' },
      { offset: 0.5, color: '#0e7490' },
      { offset: 1, color: '#67e8f9' },
    ],
  },
  deep: {
    label: 'Deep',
    stops: [
      { offset: 0, color: '#312e81' },
      { offset: 0.55, color: '#7c3aed' },
      { offset: 1, color: '#f472b6' },
    ],
  },
};

export function isShareGradientKey(v: string): v is ShareGradientKey {
  return (SHARE_GRADIENT_KEYS as readonly string[]).includes(v);
}

export function isShareHexColor(v: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);
}

export function shareGradientCss(
  stops: { offset: number; color: string }[]
): string {
  const parts = stops.map((s) => `${s.color} ${s.offset * 100}%`);
  return `linear-gradient(135deg, ${parts.join(', ')})`;
}

// Hydrate sidecar JSON (or null when absent / unparseable) into a
// validated ShareConfig. Unknown values fall back to defaults so a
// corrupted blob never crashes the viewer/editor.
export function hydrateShareConfig(raw: unknown): ShareConfig {
  if (!raw || typeof raw !== 'object') return DEFAULT_SHARE_CONFIG;
  const obj = raw as Record<string, unknown>;
  const bg =
    typeof obj.background === 'string' &&
    (obj.background === 'transparent' ||
      isShareGradientKey(obj.background) ||
      isShareHexColor(obj.background))
      ? obj.background
      : DEFAULT_SHARE_CONFIG.background;
  const corner = ((): ShareCameraCorner => {
    const v = obj.cameraCorner;
    if (
      v === 'bottom-right' ||
      v === 'bottom-left' ||
      v === 'top-right' ||
      v === 'top-left'
    ) {
      return v;
    }
    return DEFAULT_SHARE_CONFIG.cameraCorner;
  })();
  const size = ((): ShareCameraSize => {
    const v = obj.cameraSize;
    if (v === 'small' || v === 'medium' || v === 'large') return v;
    return DEFAULT_SHARE_CONFIG.cameraSize;
  })();
  return {
    background: bg,
    cameraCorner: corner,
    cameraSize: size,
    micMuted: obj.micMuted === true,
    systemMuted: obj.systemMuted === true,
  };
}
