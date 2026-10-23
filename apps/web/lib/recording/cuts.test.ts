import { describe, expect, it } from "vitest";
import {
  addCut,
  cutsEqual,
  findCutAt,
  isInsideCut,
  nextCutFrom,
  normalizeCuts,
  removeCut,
  snapOutOfCuts,
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
