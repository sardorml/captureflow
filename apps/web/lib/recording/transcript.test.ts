import { describe, expect, it } from "vitest";
import {
  activeSegmentId,
  hydrateTranscript,
  hydrateTranscriptEdits,
  isSegmentCut,
  parseTranscriptJson,
  resolveTranscript,
  transcriptToVtt,
} from "./transcript";
import type { RecordingTranscript, TranscriptRow } from "./types";

const AUTO: RecordingTranscript = {
  version: 1,
  language: "en-US",
  source: "chrome-speech-local",
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
    ["unknown source", { ...AUTO, source: "whisper" }],
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
  const row = (editedJson: string | null): TranscriptRow => ({
    slug: "abcdefgh23",
    source: "chrome-speech-local",
    language: "en-US",
    autoJson: JSON.stringify(AUTO),
    editedJson,
    createdAt: 1,
    updatedAt: 1,
  });

  it("prefers the edited transcript when present", () => {
    const edited = { ...AUTO, segments: [AUTO.segments[0]!] };
    expect(resolveTranscript(row(JSON.stringify(edited)))).toEqual({
      transcript: edited,
      hasEdits: true,
    });
  });

  it("falls back to auto and reports no transcript for a missing row", () => {
    expect(resolveTranscript(row(null))).toEqual({
      transcript: AUTO,
      hasEdits: false,
    });
    expect(resolveTranscript(row("broken"))).toEqual({
      transcript: AUTO,
      hasEdits: false,
    });
    expect(resolveTranscript(null)).toEqual({
      transcript: null,
      hasEdits: false,
    });
  });
});

describe("segment lookups", () => {
  it("marks only segments wholly inside a cut", () => {
    const cuts = [{ startMs: 1900, endMs: 4100 }];
    expect(isSegmentCut(AUTO.segments[1]!, cuts)).toBe(true);
    expect(isSegmentCut(AUTO.segments[0]!, cuts)).toBe(false);
    expect(
      isSegmentCut(AUTO.segments[1]!, [{ startMs: 2500, endMs: 9000 }]),
    ).toBe(false);
  });

  it("picks the last segment that has started", () => {
    expect(activeSegmentId(AUTO.segments, 0)).toBe("s1");
    expect(activeSegmentId(AUTO.segments, 1900)).toBe("s1");
    expect(activeSegmentId(AUTO.segments, 2000)).toBe("s2");
    expect(activeSegmentId(AUTO.segments, 9_999_999)).toBe("s3");
    expect(activeSegmentId([], 5)).toBeNull();
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

  it("keeps a cue that only overlaps a cut edge", () => {
    const vtt = transcriptToVtt(AUTO, [{ startMs: 1000, endMs: 3000 }]);
    expect(vtt).toContain("Hello there");
    expect(vtt).toContain("second phrase");
  });
});
