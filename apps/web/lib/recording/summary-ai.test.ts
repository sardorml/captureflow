import { describe, expect, it } from "vitest";
import { parseSummaryChapters, summaryPrompt } from "./summary-ai";
import type { RecordingTranscript } from "./types";

const transcript: RecordingTranscript = {
  version: 1,
  language: "en",
  segments: [
    { id: "a", startMs: 0, endMs: 4000, text: "Welcome to the demo." },
    { id: "b", startMs: 65_000, endMs: 70_000, text: "Now the settings page." },
  ],
};

describe("summaryPrompt", () => {
  it("gives each line a readable time and the exact milliseconds", () => {
    const prompt = summaryPrompt(transcript);
    expect(prompt).toContain("[0:00 · 0ms] Welcome to the demo.");
    expect(prompt).toContain("[1:05 · 65000ms] Now the settings page.");
  });

  it("cuts a very long transcript and says so", () => {
    const long: RecordingTranscript = {
      ...transcript,
      segments: Array.from({ length: 2000 }, (_, i) => ({
        id: String(i),
        startMs: i * 1000,
        endMs: i * 1000 + 900,
        text: "words and more words",
      })),
    };
    const prompt = summaryPrompt(long);
    expect(prompt.length).toBeLessThan(24_200);
    expect(prompt).toMatch(/\[transcript cut here\]$/);
  });
});

describe("parseSummaryChapters", () => {
  it("reads JSON out of a fenced reply and numbers the chapters", () => {
    const reply =
      'Here you go:\n```json\n{"summary":"A tour of the app.","chapters":[{"ms":0,"title":"Intro"},{"ms":65000,"title":"Settings"}]}\n```';
    expect(parseSummaryChapters(reply, 90_000)).toEqual({
      summary: "A tour of the app.",
      chapters: [
        { id: "c1", ms: 0, title: "Intro" },
        { id: "c2", ms: 65_000, title: "Settings" },
      ],
    });
  });

  it("accepts m:ss times, drops chapters past the end and ones too close together", () => {
    const reply = JSON.stringify({
      summary: "S",
      chapters: [
        { at: "0:00", title: "Start" },
        { at: "0:05", title: "Too soon" },
        { at: "1:05", title: "Middle" },
        { at: "3:00", title: "After the end" },
      ],
    });
    expect(parseSummaryChapters(reply, 90_000)?.chapters).toEqual([
      { id: "c1", ms: 0, title: "Start" },
      { id: "c2", ms: 65_000, title: "Middle" },
    ]);
  });

  it("takes a reply that arrives already parsed", () => {
    expect(
      parseSummaryChapters(
        { summary: "Parsed.", chapters: [{ ms: 0, title: "Intro" }] },
        90_000,
      ),
    ).toEqual({
      summary: "Parsed.",
      chapters: [{ id: "c1", ms: 0, title: "Intro" }],
    });
  });

  it("gives nothing back without a summary or without JSON", () => {
    expect(parseSummaryChapters("no json here", 1000)).toBeNull();
    expect(parseSummaryChapters('{"chapters":[]}', 1000)).toBeNull();
    expect(parseSummaryChapters('{"summary":"  "}', 1000)).toBeNull();
  });
});
