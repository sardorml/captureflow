import type { CSSProperties } from "react";
import { CDN_BASE_URL } from "@/lib/site";

// Lively two-hue blends, a step softer than the recording gradients: bright
// enough to feel chosen, soft enough under white text with a light scrim.
export const WORKSPACE_CARD_PRESETS = {
  ocean: { label: "Ocean", from: "#2f80ed", to: "#56ccf2" },
  sky: { label: "Sky", from: "#5aa9f8", to: "#8b8cff" },
  periwinkle: { label: "Periwinkle", from: "#7f9cff", to: "#b48cff" },
  lilac: { label: "Lilac", from: "#b07cf7", to: "#f07ab8" },
  berry: { label: "Berry", from: "#e4568f", to: "#9b5de5" },
  coral: { label: "Coral", from: "#ff8a65", to: "#ff6f91" },
  peach: { label: "Peach", from: "#ffb27a", to: "#ff8a80" },
  honey: { label: "Honey", from: "#f6c453", to: "#f08a5d" },
  lime: { label: "Lime", from: "#a3d977", to: "#4fb286" },
  mint: { label: "Mint", from: "#5ddcb2", to: "#3ab0c8" },
  forest: { label: "Forest", from: "#3f9d6e", to: "#9bd770" },
  graphite: { label: "Graphite", from: "#4b5563", to: "#9ca3af" },
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
    "<feComponentTransfer><feFuncR type='linear' slope='0.6' intercept='0.2'/><feFuncG type='linear' slope='0.6' intercept='0.2'/><feFuncB type='linear' slope='0.6' intercept='0.2'/><feFuncA type='table' tableValues='1 1'/></feComponentTransfer></filter>" +
    "<rect width='100%' height='100%' filter='url(#g)'/></svg>",
)}")`;

export type WorkspaceCardBackground =
  | { kind: "preset"; key: WorkspaceCardPresetKey }
  | { kind: "image"; key: string };

const IMAGE_KEY = /^workspace-cards\/[A-Za-z0-9._-]+$/;

// One text column holds either form: "preset:<name>" or "image:<r2 key>".
export function parseWorkspaceCard(
  raw: string | null | undefined,
): WorkspaceCardBackground | null {
  if (!raw) return null;
  if (raw.startsWith("preset:")) {
    const key = raw.slice("preset:".length);
    return isWorkspaceCardPresetKey(key) ? { kind: "preset", key } : null;
  }
  if (raw.startsWith("image:")) {
    const key = raw.slice("image:".length);
    return IMAGE_KEY.test(key) ? { kind: "image", key } : null;
  }
  return null;
}

export function serializeWorkspaceCard(
  bg: WorkspaceCardBackground | null,
): string | null {
  if (!bg) return null;
  return `${bg.kind}:${bg.key}`;
}

// Versioned by the workspace's updated_at like the logo: the image key is
// stable across replacements.
export function workspaceCardStyle(
  bg: WorkspaceCardBackground | null,
  updatedAt: number,
): CSSProperties {
  if (!bg) return {};
  if (bg.kind === "preset") {
    return {
      backgroundImage: `${GRAIN}, ${workspaceCardGradient(bg.key)}`,
      backgroundBlendMode: "overlay, normal",
    };
  }
  return {
    backgroundImage: `url(${CDN_BASE_URL}/${bg.key}?v=${updatedAt})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}
