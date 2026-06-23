// Default reaction set rendered in the share page bar. This is the API
// allowlist: adding an emoji here also lets it through /api/reactions
// validation.
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

// Anti-spam cap. ~500 covers a viral 1-minute clip while keeping the
// cluster overlay readable.
export const MAX_REACTIONS_PER_SHARE = 500;
