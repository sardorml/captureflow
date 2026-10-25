import type { CSSProperties } from "react";

// Lively two-hue blends, a step softer than the recording gradients: bright
// enough to feel chosen, soft enough under white text with a light scrim.
export const WORKSPACE_CARD_PRESETS = {
  ocean: { label: "Ocean", from: "#2f80ed", to: "#56ccf2" },
  sky: { label: "Sky", from: "#5aa9f8", to: "#8b8cff" },
  periwinkle: { label: "Periwinkle", from: "#7f9cff", to: "#b48cff" },
  indigo: { label: "Indigo", from: "#5b5fd6", to: "#8f7bff" },
  lilac: { label: "Lilac", from: "#b07cf7", to: "#f07ab8" },
  orchid: { label: "Orchid", from: "#c86dd7", to: "#8e6cf0" },
  berry: { label: "Berry", from: "#e4568f", to: "#9b5de5" },
  rose: { label: "Rose", from: "#f0719a", to: "#f7a1b6" },
  coral: { label: "Coral", from: "#ff8a65", to: "#ff6f91" },
  peach: { label: "Peach", from: "#ffb27a", to: "#ff8a80" },
  honey: { label: "Honey", from: "#f6c453", to: "#f08a5d" },
  sand: { label: "Sand", from: "#e0b773", to: "#c98a4b" },
  lime: { label: "Lime", from: "#a3d977", to: "#4fb286" },
  forest: { label: "Forest", from: "#3f9d6e", to: "#9bd770" },
  mint: { label: "Mint", from: "#5ddcb2", to: "#3ab0c8" },
  teal: { label: "Teal", from: "#2bb3a3", to: "#4fd1c5" },
  lagoon: { label: "Lagoon", from: "#26a0da", to: "#5ed3c7" },
  slate: { label: "Slate", from: "#64748b", to: "#94a3b8" },
  graphite: { label: "Graphite", from: "#4b5563", to: "#9ca3af" },
  plum: { label: "Plum", from: "#6d4c7d", to: "#a884b3" },
} as const satisfies Record<
  string,
  { label: string; from: string; to: string }
>;

export type WorkspaceCardPresetKey = keyof typeof WORKSPACE_CARD_PRESETS;

export const WORKSPACE_CARD_PRESET_KEYS = Object.keys(
  WORKSPACE_CARD_PRESETS,
) as WorkspaceCardPresetKey[];

export function isWorkspaceCardPresetKey(
  key: string,
): key is WorkspaceCardPresetKey {
  return key in WORKSPACE_CARD_PRESETS;
}

export function workspaceCardGradient(key: WorkspaceCardPresetKey): string {
  const { from, to } = WORKSPACE_CARD_PRESETS[key];
  return `linear-gradient(135deg, ${from}, ${to})`;
}

// A tile of opaque near-grey noise: overlay with mid grey leaves the colour
// alone, so the gradient keeps its hue and only gains texture.
const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>" +
    "<filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>" +
    "<feColorMatrix type='saturate' values='0'/>" +
    "<feComponentTransfer><feFuncR type='linear' slope='0.16' intercept='0.42'/><feFuncG type='linear' slope='0.16' intercept='0.42'/><feFuncB type='linear' slope='0.16' intercept='0.42'/><feFuncA type='table' tableValues='1 1'/></feComponentTransfer></filter>" +
    "<rect width='100%' height='100%' filter='url(#g)'/></svg>",
)}")`;

// Every workspace has a colour from day one; the id picks a stable one until
// the owner chooses.
export function defaultWorkspaceCardPreset(
  workspaceId: string,
): WorkspaceCardPresetKey {
  let hash = 0;
  for (const ch of workspaceId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return WORKSPACE_CARD_PRESET_KEYS[hash % WORKSPACE_CARD_PRESET_KEYS.length];
}

// The column holds "preset:<name>"; anything else means "not chosen yet".
export function parseWorkspaceCard(
  raw: string | null | undefined,
): WorkspaceCardPresetKey | null {
  if (!raw?.startsWith("preset:")) return null;
  const key = raw.slice("preset:".length);
  return isWorkspaceCardPresetKey(key) ? key : null;
}

export function resolveWorkspaceCard(
  raw: string | null | undefined,
  workspaceId: string,
): WorkspaceCardPresetKey {
  return parseWorkspaceCard(raw) ?? defaultWorkspaceCardPreset(workspaceId);
}

export function serializeWorkspaceCard(key: WorkspaceCardPresetKey): string {
  return `preset:${key}`;
}

export function workspaceCardStyle(key: WorkspaceCardPresetKey): CSSProperties {
  return {
    backgroundImage: `${GRAIN}, ${workspaceCardGradient(key)}`,
    backgroundBlendMode: "overlay, normal",
  };
}
