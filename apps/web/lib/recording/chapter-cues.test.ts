import { describe, expect, it } from "vitest";
import {
  chapterCues,
  cuesToVtt,
  SELECTION_CUE_ID,
  selectionCue,
} from "./chapter-cues";

const CHAPTERS = [
  { id: "c", ms: 17_000, title: "Chapter 1" },
  { id: "a", ms: 6_000, title: "Chapter 3" },
  { id: "d", ms: 17_000, title: "Chapter 2" },
  { id: "b", ms: 10_000, title: "Chapter 4" },
];

describe("chapterCues", () => {
  it("sorts, runs each chapter to the next and keeps the first of a tie", () => {
    const cues = chapterCues(CHAPTERS, 20_000);
    expect(cues.slice(0, 2)).toEqual([
      { id: "a", startMs: 6_000, endMs: 10_000, title: "Chapter 3" },
      { id: "b", startMs: 10_000, endMs: 17_000, title: "Chapter 4" },
    ]);
    expect(cues[2]).toMatchObject({ id: "c", startMs: 17_000 });
    expect(cues).toHaveLength(3);
  });

  it("drops chapters past the duration and leaves the last one open", () => {
    const cues = chapterCues(CHAPTERS, 15_000);
    expect(cues.map((c) => c.id)).toEqual(["a", "b"]);
    expect(cues[1]!.endMs).toBeGreaterThan(3_600_000);
    expect(
      chapterCues([{ id: "x", ms: 0, title: "Intro" }], null),
    ).toHaveLength(1);
  });
});

describe("cuesToVtt", () => {
  it("writes ids, timestamps and single-line titles", () => {
    const vtt = cuesToVtt([
      selectionCue({ startMs: 1_500, endMs: 62_250 }),
      { id: "a", startMs: 0, endMs: 1_500, title: "Two\nlines" },
    ]);
    expect(vtt).toBe(
      `WEBVTT\n\n${SELECTION_CUE_ID}\n00:00:01.500 --> 00:01:02.250\nSelection\n\na\n00:00:00.000 --> 00:00:01.500\nTwo lines\n`,
    );
  });
});
