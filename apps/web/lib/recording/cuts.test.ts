import { describe, expect, it } from "vitest";
import {
  addCut,
  cutsEqual,
  effectiveDurationMs,
  findCutAt,
  isCutHop,
  isInsideCut,
  nextCutFrom,
  normalizeCuts,
  removeCut,
  snapOutOfCuts,
  toEditedMs,
  timelineClips,
  toSourceMs,
  trimClip,
} from "./cuts";

const CUTS = [
  { startMs: 1000, endMs: 2000 },
  { startMs: 5000, endMs: 8000 },
];

describe("normalizeCuts", () => {
  it("drops junk, rounds, sorts and merges overlapping spans", () => {
    expect(
      normalizeCuts([
        { startMs: 5000, endMs: 6000 },
        { startMs: 5500.4, endMs: 8000 },
        { startMs: 1000, endMs: 2000 },
        { startMs: 2000, endMs: 2500 },
        { startMs: 3000, endMs: 3000 },
        { startMs: 4000, endMs: 3900 },
        { startMs: -50, endMs: 10 },
        { startMs: Number.NaN, endMs: 10 },
        { startMs: "0", endMs: 10 },
        null,
        "x",
      ]),
    ).toEqual([
      { startMs: 0, endMs: 10 },
      { startMs: 1000, endMs: 2500 },
      { startMs: 5000, endMs: 8000 },
    ]);
  });

  it("clamps to the duration when known", () => {
    expect(
      normalizeCuts(
        [
          { startMs: 9000, endMs: 20000 },
          { startMs: 12000, endMs: 13000 },
        ],
        10000,
      ),
    ).toEqual([{ startMs: 9000, endMs: 10000 }]);
  });

  it("returns an empty list for anything but an array", () => {
    expect(normalizeCuts(undefined)).toEqual([]);
    expect(normalizeCuts({ startMs: 0, endMs: 1 })).toEqual([]);
  });

  it("caps the number of cuts", () => {
    const raw = Array.from({ length: 600 }, (_, i) => ({
      startMs: i * 10,
      endMs: i * 10 + 5,
    }));
    expect(normalizeCuts(raw)).toHaveLength(500);
  });
});

describe("lookups", () => {
  it("treats the end of a cut as outside it", () => {
    expect(findCutAt(1000, CUTS)).toEqual(CUTS[0]);
    expect(findCutAt(1999, CUTS)).toEqual(CUTS[0]);
    expect(findCutAt(2000, CUTS)).toBeNull();
    expect(isInsideCut(6000, CUTS)).toBe(true);
    expect(isInsideCut(500, CUTS)).toBe(false);
  });

  it("snaps a time inside a cut to its end and leaves others alone", () => {
    expect(snapOutOfCuts(1500, CUTS)).toBe(2000);
    expect(snapOutOfCuts(3000, CUTS)).toBe(3000);
  });

  it("finds the next cut playback will meet", () => {
    expect(nextCutFrom(0, CUTS)).toEqual(CUTS[0]);
    expect(nextCutFrom(1500, CUTS)).toEqual(CUTS[0]);
    expect(nextCutFrom(2000, CUTS)).toEqual(CUTS[1]);
    expect(nextCutFrom(8000, CUTS)).toBeNull();
  });
});

describe("edited timeline", () => {
  it("removes the cuts before a time and collapses a time inside one", () => {
    expect(toEditedMs(500, CUTS)).toBe(500);
    expect(toEditedMs(1000, CUTS)).toBe(1000);
    expect(toEditedMs(1500, CUTS)).toBe(1000);
    expect(toEditedMs(2000, CUTS)).toBe(1000);
    expect(toEditedMs(3000, CUTS)).toBe(2000);
    expect(toEditedMs(9000, CUTS)).toBe(5000);
    expect(toEditedMs(9000, [])).toBe(9000);
  });

  it("maps edited times back, landing on a cut's end at its boundary", () => {
    expect(toSourceMs(500, CUTS)).toBe(500);
    expect(toSourceMs(1000, CUTS)).toBe(2000);
    expect(toSourceMs(2000, CUTS)).toBe(3000);
    expect(toSourceMs(4000, CUTS)).toBe(8000);
    expect(toSourceMs(5000, CUTS)).toBe(9000);
    for (const ms of [0, 999, 1000, 2500, 4000, 6000]) {
      expect(toEditedMs(toSourceMs(ms, CUTS), CUTS)).toBe(ms);
    }
  });

  it("gives the duration with the cuts removed, ignoring overhang", () => {
    expect(effectiveDurationMs(10_000, CUTS)).toBe(6000);
    expect(effectiveDurationMs(6000, CUTS)).toBe(4000);
    expect(effectiveDurationMs(10_000, [])).toBe(10_000);
  });
});

describe("addCut / removeCut", () => {
  it("adds and merges", () => {
    expect(addCut(CUTS, { startMs: 1800, endMs: 5200 })).toEqual([
      { startMs: 1000, endMs: 8000 },
    ]);
  });

  it("restores a span by trimming or splitting the cuts around it", () => {
    expect(removeCut(CUTS, { startMs: 6000, endMs: 7000 })).toEqual([
      { startMs: 1000, endMs: 2000 },
      { startMs: 5000, endMs: 6000 },
      { startMs: 7000, endMs: 8000 },
    ]);
    expect(removeCut(CUTS, { startMs: 500, endMs: 1500 })).toEqual([
      { startMs: 1500, endMs: 2000 },
      { startMs: 5000, endMs: 8000 },
    ]);
    expect(removeCut(CUTS, { startMs: 1000, endMs: 2000 })).toEqual([CUTS[1]]);
    expect(removeCut(CUTS, { startMs: 3000, endMs: 4000 })).toEqual(CUTS);
  });
});

describe("isCutHop", () => {
  it("is a move from a cut's start to its end", () => {
    expect(isCutHop(990, 2010, CUTS)).toBe(true);
    expect(isCutHop(4950, 8000, CUTS)).toBe(true);
  });

  it("is a move out of a cut the playhead was resting in", () => {
    expect(isCutHop(6500, 8000, CUTS)).toBe(true);
  });

  it("isn't a seek that merely crosses a cut, or ordinary playback", () => {
    expect(isCutHop(100, 2010, CUTS)).toBe(false);
    expect(isCutHop(990, 6000, CUTS)).toBe(false);
    expect(isCutHop(3000, 3016, CUTS)).toBe(false);
  });
});

describe("timelineClips", () => {
  it("is one clip for an untouched recording", () => {
    expect(timelineClips(10000, [], [])).toEqual([
      { startMs: 0, endMs: 10000 },
    ]);
  });

  it("leaves a gap for each cut", () => {
    expect(timelineClips(10000, CUTS, [])).toEqual([
      { startMs: 0, endMs: 1000 },
      { startMs: 2000, endMs: 5000 },
      { startMs: 8000, endMs: 10000 },
    ]);
  });

  it("divides at splits, in any order, ignoring those inside a cut", () => {
    expect(timelineClips(10000, CUTS, [9000, 3000, 6000])).toEqual([
      { startMs: 0, endMs: 1000 },
      { startMs: 2000, endMs: 3000 },
      { startMs: 3000, endMs: 5000 },
      { startMs: 8000, endMs: 9000 },
      { startMs: 9000, endMs: 10000 },
    ]);
  });

  it("draws no clip where a cut touches an edge, or with no duration", () => {
    expect(
      timelineClips(
        10000,
        [
          { startMs: 0, endMs: 1000 },
          { startMs: 9000, endMs: 10000 },
        ],
        [],
      ),
    ).toEqual([{ startMs: 1000, endMs: 9000 }]);
    expect(timelineClips(0, CUTS, [])).toEqual([]);
  });
});

describe("trimClip", () => {
  const CLIP = { startMs: 2000, endMs: 5000 };

  it("cuts away what an edge leaves behind", () => {
    expect(trimClip(CUTS, CLIP, "end", 4000)).toEqual([
      CUTS[0],
      { startMs: 4000, endMs: 8000 },
    ]);
    expect(trimClip(CUTS, CLIP, "start", 3000)).toEqual([
      { startMs: 1000, endMs: 3000 },
      CUTS[1],
    ]);
  });

  it("takes back part of the gap beside an edge", () => {
    expect(trimClip(CUTS, CLIP, "end", 6000)).toEqual([
      CUTS[0],
      { startMs: 6000, endMs: 8000 },
    ]);
    expect(trimClip(CUTS, CLIP, "start", 1500)).toEqual([
      { startMs: 1000, endMs: 1500 },
      CUTS[1],
    ]);
  });

  it("closes the gap and stops at the neighbouring clip", () => {
    expect(trimClip(CUTS, CLIP, "end", 9500)).toEqual([CUTS[0]]);
    expect(trimClip(CUTS, CLIP, "start", 0)).toEqual([CUTS[1]]);
  });

  it("can't grow into a clip with no gap between them", () => {
    expect(trimClip([], { startMs: 0, endMs: 1000 }, "end", 2000)).toEqual([]);
    expect(trimClip([], { startMs: 1000, endMs: 2000 }, "start", 0)).toEqual(
      [],
    );
  });

  it("never trims a clip away entirely", () => {
    expect(trimClip(CUTS, CLIP, "end", 0)).toEqual([
      CUTS[0],
      { startMs: 2200, endMs: 8000 },
    ]);
    expect(trimClip(CUTS, CLIP, "start", 9000)).toEqual([
      { startMs: 1000, endMs: 4800 },
      CUTS[1],
    ]);
  });
});

describe("cutsEqual", () => {
  it("compares by value", () => {
    expect(
      cutsEqual(
        CUTS,
        CUTS.map((c) => ({ ...c })),
      ),
    ).toBe(true);
    expect(cutsEqual(CUTS, [CUTS[0]!])).toBe(false);
    expect(cutsEqual(CUTS, [CUTS[0]!, { startMs: 5000, endMs: 8001 }])).toBe(
      false,
    );
  });
});
