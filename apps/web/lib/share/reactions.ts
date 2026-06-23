// Also the /api/reactions allowlist: adding an emoji here lets it through validation.
export const DEFAULT_REACTIONS = [
  { emoji: '❤️', label: 'Heart' },
  { emoji: '👍', label: 'Thumbs up' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '🙌', label: 'Raised hands' },
  { emoji: '👀', label: 'Eyes' },
] as const;

export const ALLOWED_REACTION_EMOJIS = new Set<string>(
  DEFAULT_REACTIONS.map((r) => r.emoji)
);

// Anti-spam cap, also keeps the cluster overlay readable.
export const MAX_REACTIONS_PER_SHARE = 500;
