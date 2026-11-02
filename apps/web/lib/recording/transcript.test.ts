import { describe, expect, it } from "vitest";
import {
  activeSegmentId,
  hydrateTranscript,
  hydrateTranscriptEdits,
  isWordCut,
  isWordInSpan,
  keptSegments,
  parseTranscriptJson,
  resolveTranscript,
  segmentWords,
  transcriptToVtt,
} from "./transcript";
import type { RecordingTranscript, TranscriptRow } from "./types";

const AUTO: RecordingTranscript = {
  version: 1,
  language: "en-US",
  segments: [
    { id: "s1", startMs: 0, endMs: 1500, text: "Hello there" },
    {
      id: "s2",
      startMs: 2000,
      endMs: 4000,
      text: "second phrase",
      words: [
        { text: "second", startMs: 2000, endMs: 2500 },
        { text: "phrase", startMs: 2600, endMs: 4000 },
      ],
    },
    { id: "s3", startMs: 3_661_250, endMs: 3_662_000, text: "late & <b>" },
  ],
};

describe("hydrateTranscript", () => {
  it("accepts a well-formed transcript unchanged", () => {
    expect(hydrateTranscript(AUTO)).toEqual(AUTO);
  });

  it.each([
    ["not an object", "nope"],
    ["wrong version", { ...AUTO, version: 2 }],
    ["missing segments", { ...AUTO, segments: undefined }],
    ["no usable segments", { ...AUTO, segments: [{ id: "x", text: "" }] }],
  ])("rejects %s", (_name, raw) => {
    expect(hydrateTranscript(raw)).toBeNull();
  });

  it("drops malformed segments and keeps the rest sorted", () => {
    const out = hydrateTranscript({
      ...AUTO,
      segments: [
        { id: "b", startMs: 5000, endMs: 6000, text: "  two   words " },
        { id: "bad id!", startMs: 0, endMs: 1, text: "x" },
        { id: "neg", startMs: -5, endMs: 1, text: "x" },
        { id: "inverted", startMs: 10, endMs: 1, text: "x" },
        { id: "nan", startMs: Number.NaN, endMs: 1, text: "x" },
        { id: "a", startMs: 1000.4, endMs: 2000.6, text: "one" },
        { id: "a", startMs: 9000, endMs: 9500, text: "duplicate id" },
      ],
    });
    expect(out?.segments).toEqual([
      { id: "a", startMs: 1000, endMs: 2001, text: "one" },
      { id: "b", startMs: 5000, endMs: 6000, text: "two words" },
    ]);
  });

  it("normalizes the language tag and caps text length", () => {
    const out = hydrateTranscript({
      ...AUTO,
      language: "english please",
      segments: [{ id: "a", startMs: 0, endMs: 1, text: "x".repeat(2_000) }],
    });
    expect(out?.language).toBeNull();
    expect(out?.segments[0]?.text).toHaveLength(1_000);
    expect(hydrateTranscript({ ...AUTO, language: "pt-BR" })?.language).toBe(
      "pt-BR",
    );
  });

  it("drops broken words but keeps the segment", () => {
    const out = hydrateTranscript({
      ...AUTO,
      segments: [
        {
          id: "a",
          startMs: 0,
          endMs: 1000,
          text: "one two",
          words: [
            { text: "one", startMs: 0, endMs: 400 },
            { text: "", startMs: 400, endMs: 500 },
            { text: "two", startMs: "late", endMs: 1000 },
          ],
        },
      ],
    });
    expect(out?.segments[0]?.words).toEqual([
      { text: "one", startMs: 0, endMs: 400 },
    ]);
  });

  it("caps the segment count", () => {
    const segments = Array.from({ length: 2_500 }, (_, i) => ({
      id: `s${i}`,
      startMs: i * 10,
      endMs: i * 10 + 5,
      text: "w",
    }));
    expect(hydrateTranscript({ ...AUTO, segments })?.segments).toHaveLength(
      2_000,
    );
  });
});

describe("parseTranscriptJson", () => {
  it("round-trips and tolerates bad input", () => {
    expect(parseTranscriptJson(JSON.stringify(AUTO))).toEqual(AUTO);
    expect(parseTranscriptJson(null)).toBeNull();
    expect(parseTranscriptJson("{not json")).toBeNull();
    expect(parseTranscriptJson("{}")).toBeNull();
  });
});

describe("hydrateTranscriptEdits", () => {
  it("replaces text by id, keeps auto timings and drops omitted segments", () => {
    const out = hydrateTranscriptEdits(
      {
        segments: [
          { id: "s2", text: "second phrase" },
          { id: "s1", text: " Hello,  there! " },
          { id: "ghost", text: "never existed" },
        ],
      },
      AUTO,
    );
    expect(out).toEqual({
      ...AUTO,
      segments: [
        { id: "s1", startMs: 0, endMs: 1500, text: "Hello, there!" },
        AUTO.segments[1],
      ],
    });
  });

  it("drops word timings once the text changes", () => {
    const out = hydrateTranscriptEdits(
      { segments: [{ id: "s2", text: "second sentence" }] },
      AUTO,
    );
    expect(out?.segments[0]?.words).toBeUndefined();
  });

  it("treats an emptied segment as deleted", () => {
    const out = hydrateTranscriptEdits(
      {
        segments: [
          { id: "s1", text: "   " },
          { id: "s3", text: "late" },
        ],
      },
      AUTO,
    );
    expect(out?.segments.map((s) => s.id)).toEqual(["s3"]);
  });

  it("rejects malformed edits and edits that empty the transcript", () => {
    expect(hydrateTranscriptEdits(null, AUTO)).toBeNull();
    expect(hydrateTranscriptEdits({ segments: "s1" }, AUTO)).toBeNull();
    expect(hydrateTranscriptEdits({ segments: [] }, AUTO)).toBeNull();
  });
});

describe("resolveTranscript", () => {
  const row = (
    editedJson: string | null,
    status: TranscriptRow["status"] = "ready",
    autoJson: string | null = JSON.stringify(AUTO),
  ): TranscriptRow => ({
    slug: "abcdefgh23",
    status,
    language: "en-US",
    partCount: 1,
    autoJson,
    editedJson,
    error: null,
    createdAt: 1,
    updatedAt: 1,
  });

  it("prefers the edited transcript when present", () => {
    const edited = { ...AUTO, segments: [AUTO.segments[0]!] };
    expect(resolveTranscript(row(JSON.stringify(edited)))).toEqual({
      status: "ready",
      transcript: edited,
      hasEdits: true,
    });
  });

  it("falls back to auto and reports no transcript for a missing row", () => {
    expect(resolveTranscript(row(null))).toEqual({
      status: "ready",
      transcript: AUTO,
      hasEdits: false,
    });
    expect(resolveTranscript(row("broken"))).toEqual({
      status: "ready",
      transcript: AUTO,
      hasEdits: false,
    });
    expect(resolveTranscript(null)).toEqual({
      status: "none",
      transcript: null,
      hasEdits: false,
    });
  });

  it("reports the job state while it runs or after it fails", () => {
    expect(resolveTranscript(row(null, "pending", null))).toEqual({
      status: "pending",
      transcript: null,
      hasEdits: false,
    });
    expect(resolveTranscript(row(null, "failed", null))).toEqual({
      status: "failed",
      transcript: null,
      hasEdits: false,
    });
  });

  it("treats a ready job that heard nothing as no transcript", () => {
    expect(resolveTranscript(row(null, "ready", null))).toEqual({
      status: "none",
      transcript: null,
      hasEdits: false,
    });
  });
});

describe("segment lookups", () => {
  it("picks the last segment that has started", () => {
    expect(activeSegmentId(AUTO.segments, 0)).toBe("s1");
    expect(activeSegmentId(AUTO.segments, 1900)).toBe("s1");
    expect(activeSegmentId(AUTO.segments, 2000)).toBe("s2");
    expect(activeSegmentId(AUTO.segments, 9_999_999)).toBe("s3");
    expect(activeSegmentId([], 5)).toBeNull();
  });
});

describe("word timings", () => {
  const TIMED = {
    id: "s1",
    startMs: 0,
    endMs: 3000,
    text: "one two three",
    words: [
      { text: "one", startMs: 0, endMs: 1000 },
      { text: "two", startMs: 1000, endMs: 2000 },
      { text: "three", startMs: 2000, endMs: 3000 },
    ],
  };

  it("uses a line's own word timings", () => {
    expect(segmentWords(TIMED)).toBe(TIMED.words);
  });

  it("shares a fixed line's length out by character count", () => {
    expect(
      segmentWords({ id: "s1", startMs: 100, endMs: 1100, text: "a bbb" }),
    ).toEqual([
      { text: "a", startMs: 100, endMs: 350 },
      { text: "bbb", startMs: 350, endMs: 1100 },
    ]);
  });

  it("decides a word by its middle", () => {
    const word = TIMED.words[1]!;
    expect(isWordInSpan(word, { startMs: 1400, endMs: 1600 })).toBe(true);
    expect(isWordInSpan(word, { startMs: 1600, endMs: 5000 })).toBe(false);
    expect(isWordCut(word, [{ startMs: 0, endMs: 1500 }])).toBe(false);
    expect(isWordCut(word, [{ startMs: 0, endMs: 1501 }])).toBe(true);
  });

  it("holds a selection on a word with no length", () => {
    const word = { text: "uh", startMs: 500, endMs: 500 };
    expect(isWordInSpan(word, { startMs: 500, endMs: 501 })).toBe(true);
  });

  it("drops cut words, then emptied lines", () => {
    const [kept] = keptSegments([TIMED], [{ startMs: 1000, endMs: 2000 }]);
    expect(kept).toMatchObject({ text: "one three" });
    expect(kept!.words!.map((w) => w.text)).toEqual(["one", "three"]);
    expect(keptSegments([TIMED], [{ startMs: 0, endMs: 3000 }])).toEqual([]);
  });

  it("returns an untouched line as it was", () => {
    expect(keptSegments([TIMED], [])[0]).toBe(TIMED);
  });
});

describe("transcriptToVtt", () => {
  it("writes numbered cues with hh:mm:ss.mmm times and escaped text", () => {
    expect(transcriptToVtt(AUTO)).toBe(
      [
        "WEBVTT",
        "",
        "1",
        "00:00:00.000 --> 00:00:01.500",
        "Hello there",
        "",
        "2",
        "00:00:02.000 --> 00:00:04.000",
        "second phrase",
        "",
        "3",
        "01:01:01.250 --> 01:01:02.000",
        "late &amp; &lt;b&gt;",
        "",
      ].join("\n"),
    );
  });

  it("omits cues lying wholly inside a cut and renumbers", () => {
    const vtt = transcriptToVtt(AUTO, [{ startMs: 1900, endMs: 4100 }]);
    expect(vtt).not.toContain("second phrase");
    expect(vtt).toContain("2\n01:01:01.250");
  });

  it("takes only the cut words out of a cue the cut overlaps", () => {
    const vtt = transcriptToVtt(AUTO, [{ startMs: 1000, endMs: 2200 }]);
    expect(vtt).toContain("Hello\n");
    expect(vtt).not.toContain("there");
    expect(vtt).toContain("second phrase");
  });
});
