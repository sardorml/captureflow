import { describe, expect, it } from "vitest";
import { BURST_GAP_MS, groupReactionBursts } from "./reaction-bursts";
import type { RecordingReaction } from "./types";

const reaction = (
  id: number,
  overrides: Partial<RecordingReaction> = {},
): RecordingReaction => ({
  id,
  slug: "abc",
  emoji: "🙌",
  timestampMs: 4000,
  createdAt: 1_000_000 + id * 500,
  userId: "u1",
  userName: "Sam",
  userImage: null,
  ...overrides,
});

describe("reaction bursts", () => {
  it("folds a run of taps from one person into a row with counts", () => {
    const bursts = groupReactionBursts([
      reaction(1),
      reaction(2),
      reaction(3, { emoji: "👏" }),
      reaction(4),
    ]);
    expect(bursts).toHaveLength(1);
    expect(bursts[0]).toMatchObject({
      id: 1,
      reactionIds: [1, 2, 3, 4],
      emojis: [
        { emoji: "🙌", count: 3 },
        { emoji: "👏", count: 1 },
      ],
    });
    expect(bursts[0]?.createdAt).toBe(reaction(4).createdAt);
  });

  it("splits on a different person or a long pause", () => {
    const bursts = groupReactionBursts([
      reaction(1),
      reaction(2, { userId: "u2", userName: "Ana" }),
      reaction(3, { createdAt: reaction(2).createdAt + BURST_GAP_MS + 1 }),
    ]);
    expect(bursts.map((b) => b.reactionIds)).toEqual([[1], [2], [3]]);
  });

  it("keeps anonymous reactions apart unless the names match", () => {
    const bursts = groupReactionBursts([
      reaction(1, { userId: null, userName: null }),
      reaction(2, { userId: null, userName: null }),
      reaction(3, { userId: null, userName: "Guest" }),
    ]);
    expect(bursts.map((b) => b.reactionIds)).toEqual([[1, 2], [3]]);
  });

  it("orders by creation time regardless of input order", () => {
    const bursts = groupReactionBursts([reaction(3), reaction(1), reaction(2)]);
    expect(bursts[0]?.reactionIds).toEqual([1, 2, 3]);
  });
});
