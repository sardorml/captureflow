import type { RecordingReaction } from "./types";

export type ReactionBurst = {
  // The first reaction's id, stable while the burst grows at its tail.
  id: number;
  userId: string | null;
  userName: string | null;
  userImage: string | null;
  timestampMs: number;
  createdAt: number;
  emojis: { emoji: string; count: number }[];
  reactionIds: number[];
};

// A tap-tap-tap on one emoji, or a flurry of several, lands as one row:
// reactions from the same person within this gap of the previous one.
export const BURST_GAP_MS = 60_000;

function sameAuthor(a: RecordingReaction, b: RecordingReaction): boolean {
  return a.userId
    ? a.userId === b.userId
    : !b.userId && a.userName === b.userName;
}

// Reactions are taken in creation order; a burst ends when the author
// changes or the gap since the previous reaction exceeds BURST_GAP_MS.
export function groupReactionBursts(
  reactions: RecordingReaction[],
): ReactionBurst[] {
  const sorted = [...reactions].sort((a, b) => a.createdAt - b.createdAt);
  const bursts: ReactionBurst[] = [];
  let last: RecordingReaction | null = null;
  for (const r of sorted) {
    const current = bursts[bursts.length - 1];
    if (
      current &&
      last &&
      sameAuthor(last, r) &&
      r.createdAt - last.createdAt <= BURST_GAP_MS
    ) {
      const slot = current.emojis.find((e) => e.emoji === r.emoji);
      if (slot) slot.count += 1;
      else current.emojis.push({ emoji: r.emoji, count: 1 });
      current.reactionIds.push(r.id);
      current.createdAt = r.createdAt;
      current.userImage ??= r.userImage;
    } else {
      bursts.push({
        id: r.id,
        userId: r.userId,
        userName: r.userName,
        userImage: r.userImage,
        timestampMs: r.timestampMs,
        createdAt: r.createdAt,
        emojis: [{ emoji: r.emoji, count: 1 }],
        reactionIds: [r.id],
      });
    }
    last = r;
  }
  return bursts;
}
