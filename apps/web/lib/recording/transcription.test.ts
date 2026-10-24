import { describe, expect, it } from "vitest";
import {
  assembleTranscript,
  bytesToBase64,
  hydrateTranscribeRequest,
  hydrateTranscriptionJobMessage,
  linesFromWhisper,
  parseLinesJson,
  whisperLanguage,
} from "./transcription";

const SLUG = "abcdefgh23";

describe("hydrateTranscribeRequest", () => {
  it("accepts a sorted, bounded chunk layout", () => {
    expect(
      hydrateTranscribeRequest({
        slug: SLUG,
        language: "en-US",
        parts: [
          { partNumber: 2, startMs: 120000.4, endMs: 240000 },
          { partNumber: 1, startMs: 0, endMs: 120000 },
        ],
      }),
    ).toEqual({
      slug: SLUG,
      language: "en-US",
      parts: [
        { partNumber: 1, startMs: 0, endMs: 120000 },
        { partNumber: 2, startMs: 120000, endMs: 240000 },
      ],
    });
  });

  it.each([
    ["no parts", { slug: SLUG, parts: [] }],
    [
      "bad slug",
      { slug: "x", parts: [{ partNumber: 1, startMs: 0, endMs: 1 }] },
    ],
    [
      "duplicate part",
      {
        slug: SLUG,
        parts: [
          { partNumber: 1, startMs: 0, endMs: 1 },
          { partNumber: 1, startMs: 1, endMs: 2 },
        ],
      },
    ],
    [
      "inverted span",
      { slug: SLUG, parts: [{ partNumber: 1, startMs: 5, endMs: 5 }] },
    ],
    [
      "part too long",
      {
        slug: SLUG,
        parts: [{ partNumber: 1, startMs: 0, endMs: 11 * 60_000 }],
      },
    ],
    [
      "non-integer part",
      { slug: SLUG, parts: [{ partNumber: 1.5, startMs: 0, endMs: 1 }] },
    ],
  ])("rejects %s", (_name, raw) => {
    expect(hydrateTranscribeRequest(raw)).toBeNull();
  });

  it("drops an invalid language tag", () => {
    expect(
      hydrateTranscribeRequest({
        slug: SLUG,
        language: "english!",
        parts: [{ partNumber: 1, startMs: 0, endMs: 1000 }],
      })?.language,
    ).toBeNull();
  });
});

describe("hydrateTranscriptionJobMessage", () => {
  it("accepts a slug and a positive part number only", () => {
    expect(
      hydrateTranscriptionJobMessage({ slug: SLUG, partNumber: 3 }),
    ).toEqual({
      slug: SLUG,
      partNumber: 3,
    });
    expect(
      hydrateTranscriptionJobMessage({ slug: SLUG, partNumber: 0 }),
    ).toBeNull();
    expect(hydrateTranscriptionJobMessage("nope")).toBeNull();
  });
});

describe("whisperLanguage", () => {
  it("keeps the primary subtag", () => {
    expect(whisperLanguage("en-US")).toBe("en");
    expect(whisperLanguage("pt")).toBe("pt");
    expect(whisperLanguage(null)).toBeUndefined();
  });
});

// Shape taken from a real Whisper response from Workers AI.
const WHISPER = {
  text: "Welcome to the demo. Here is the dashboard. And this is the editor.",
  segments: [
    {
      start: 0,
      end: 4.08,
      text: " Welcome to the demo. Here is the dashboard. And this is the editor.",
      words: [
        { word: " Welcome", start: 0, end: 0.32 },
        { word: " to", start: 0.32, end: 0.52 },
        { word: " the", start: 0.52, end: 0.64 },
        { word: " demo.", start: 0.64, end: 1.1 },
        { word: " Here", start: 1.5, end: 1.7 },
        { word: " is", start: 1.7, end: 1.8 },
        { word: " the", start: 1.8, end: 1.9 },
        { word: " dashboard.", start: 1.9, end: 2.5 },
        { word: " And", start: 2.9, end: 3.0 },
        { word: " this", start: 3.0, end: 3.2 },
        { word: " is", start: 3.2, end: 3.3 },
        { word: " the", start: 3.3, end: 3.4 },
        { word: " editor.", start: 3.4, end: 4.08 },
      ],
    },
  ],
};

describe("linesFromWhisper", () => {
  it("splits at sentence ends and keeps word timings on the recording clock", () => {
    const lines = linesFromWhisper(WHISPER, 60_000, 70_000);
    expect(lines.map((l) => [l.startMs, l.endMs, l.text])).toEqual([
      [60_000, 61_100, "Welcome to the demo."],
      [61_500, 62_500, "Here is the dashboard."],
      [62_900, 64_080, "And this is the editor."],
    ]);
    expect(lines[0]?.words).toEqual([
      { text: "Welcome", startMs: 60_000, endMs: 60_320 },
      { text: "to", startMs: 60_320, endMs: 60_520 },
      { text: "the", startMs: 60_520, endMs: 60_640 },
      { text: "demo.", startMs: 60_640, endMs: 61_100 },
    ]);
  });

  it("breaks long runs without punctuation by time and length", () => {
    const words = Array.from({ length: 40 }, (_, i) => ({
      word: ` word${i}`,
      start: i * 0.5,
      end: i * 0.5 + 0.4,
    }));
    const lines = linesFromWhisper(
      { segments: [{ start: 0, end: 20, text: "", words }] },
      0,
      60_000,
    );
    expect(lines.length).toBeGreaterThan(1);
    for (const line of lines) {
      expect(line.endMs - line.startMs).toBeLessThanOrEqual(12_000);
      expect(line.text.length).toBeLessThanOrEqual(160);
    }
    expect(lines.flatMap((l) => l.words ?? [])).toHaveLength(40);
  });

  it("falls back to the segment text when words are missing and clamps to the chunk end", () => {
    const lines = linesFromWhisper(
      { segments: [{ start: 1, end: 9, text: "  no words  here " }] },
      0,
      5_000,
    );
    expect(lines).toEqual([
      { startMs: 1_000, endMs: 5_000, text: "no words here" },
    ]);
  });

  it("ignores junk", () => {
    expect(linesFromWhisper(null, 0, 1)).toEqual([]);
    expect(linesFromWhisper({ segments: [{ start: "a" }] }, 0, 1)).toEqual([]);
  });
});

describe("assembleTranscript", () => {
  it("orders parts and numbers the lines", () => {
    const out = assembleTranscript(
      [
        {
          partNumber: 2,
          lines: [{ startMs: 120_000, endMs: 121_000, text: "later" }],
        },
        { partNumber: 1, lines: [{ startMs: 0, endMs: 1_000, text: "first" }] },
      ],
      "en-US",
    );
    expect(out).toEqual({
      version: 1,
      language: "en-US",
      segments: [
        { id: "s1", startMs: 0, endMs: 1_000, text: "first" },
        { id: "s2", startMs: 120_000, endMs: 121_000, text: "later" },
      ],
    });
  });
});

describe("parseLinesJson", () => {
  it("round-trips and tolerates bad input", () => {
    const lines = [{ startMs: 0, endMs: 10, text: "x" }];
    expect(parseLinesJson(JSON.stringify(lines))).toEqual(lines);
    expect(parseLinesJson(null)).toEqual([]);
    expect(parseLinesJson("{")).toEqual([]);
    expect(parseLinesJson(JSON.stringify([{ text: 1 }]))).toEqual([]);
  });
});

describe("bytesToBase64", () => {
  it("matches the platform encoder", () => {
    const bytes = new Uint8Array(70_000).map((_, i) => i % 251);
    expect(bytesToBase64(bytes.buffer)).toBe(
      Buffer.from(bytes).toString("base64"),
    );
  });
});
