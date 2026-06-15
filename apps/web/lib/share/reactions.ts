// Default reaction set rendered in the share page bar. Kept in sync
// with the API allowlist — adding a new emoji here also lets it
// through /api/reactions validation. No "add custom reaction" button
// for now; users tap one of these six.
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

// Anti-spam cap: a single share can hold a lot of reactions but not
// unbounded. ~500 is enough for a viral 1-minute clip without making
// the cluster overlay unreadable.
export const MAX_REACTIONS_PER_SHARE = 500;
