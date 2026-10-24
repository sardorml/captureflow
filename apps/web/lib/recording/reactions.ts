// Also the /api/reactions allowlist: adding an emoji here lets it through
// validation. `color` is the emoji's dot on the player's time slider.
export const DEFAULT_REACTIONS = [
  { emoji: "❤️", label: "Heart", color: "#f0384a" },
  { emoji: "👍", label: "Thumbs up", color: "#3b82f6" },
  { emoji: "🔥", label: "Fire", color: "#f97316" },
  { emoji: "👏", label: "Clap", color: "#facc15" },
  { emoji: "🙌", label: "Raised hands", color: "#f59e0b" },
  { emoji: "👀", label: "Eyes", color: "#a3e635" },
] as const;

export const ALLOWED_REACTION_EMOJIS = new Set<string>(
  DEFAULT_REACTIONS.map((r) => r.emoji),
);

const REACTION_COLORS = new Map<string, string>(
  DEFAULT_REACTIONS.map((r) => [r.emoji, r.color]),
);

export function reactionColor(emoji: string): string {
  return REACTION_COLORS.get(emoji) ?? "#ffffff";
}

// Anti-spam cap, also keeps the cluster overlay readable.
export const MAX_REACTIONS_PER_RECORDING = 500;
