import { describe, expect, it } from "vitest";
import {
  buildTranscript,
  createSegmentClock,
} from "../lib/capture/transcript-timeline";

const T0 = 1_700_000_000_000;

describe("createSegmentClock", () => {
  it("maps epoch time to recording time and removes pauses", () => {
    const clock = createSegmentClock({ startedAt: T0 });
    expect(clock.toRecordingMs(T0)).toBe(0);
    expect(clock.toRecordingMs(T0 + 5_000)).toBe(5_000);
    clock.pause(T0 + 10_000);
    expect(clock.toRecordingMs(T0 + 12_000)).toBe(10_000);
    expect(clock.isPausedAt(T0 + 12_000)).toBe(true);
    clock.resume(T0 + 15_000);
    expect(clock.toRecordingMs(T0 + 15_000)).toBe(10_000);
    expect(clock.toRecordingMs(T0 + 20_000)).toBe(15_000);
    expect(clock.isPausedAt(T0 + 20_000)).toBe(false);
  });

  it("ignores a second pause while paused and a resume while running", () => {
    const clock = createSegmentClock({ startedAt: T0 });
    clock.resume(T0 + 1_000);
    clock.pause(T0 + 2_000);
    clock.pause(T0 + 3_000);
    clock.resume(T0 + 4_000);
    expect(clock.toRecordingMs(T0 + 6_000)).toBe(4_000);
  });

  it("never goes below zero", () => {
    const clock = createSegmentClock({ startedAt: T0 });
    expect(clock.toRecordingMs(T0 - 500)).toBe(0);
  });
});

describe("buildTranscript", () => {
  const options = {
    durationMs: 60_000,
    source: "chrome-speech-local" as const,
    language: "en-US",
  };

  it("turns utterances into leading, clamped segments", () => {
    const clock = createSegmentClock({ startedAt: T0 });
    const out = buildTranscript(
      [
        {
          firstInterimAt: T0 + 1_000,
          finalAt: T0 + 3_000,
          text: "  hello   there ",
        },
        { firstInterimAt: T0 + 100, finalAt: T0 + 200, text: "hi" },
        { firstInterimAt: T0 + 59_900, finalAt: T0 + 61_000, text: "bye" },
        { firstInterimAt: T0 + 5_000, finalAt: T0 + 6_000, text: "   " },
      ],
      { clock, ...options },
    );
    expect(out).toEqual({
      version: 1,
      language: "en-US",
      source: "chrome-speech-local",
      segments: [
        { id: "s2", startMs: 0, endMs: 300, text: "hi" },
        { id: "s1", startMs: 600, endMs: 2_700, text: "hello there" },
        { id: "s3", startMs: 59_500, endMs: 60_000, text: "bye" },
      ],
    });
  });

  it("drops speech that happened entirely during a pause", () => {
    const clock = createSegmentClock({ startedAt: T0 });
    clock.pause(T0 + 10_000);
    clock.resume(T0 + 20_000);
    const out = buildTranscript(
      [
        {
          firstInterimAt: T0 + 12_000,
          finalAt: T0 + 14_000,
          text: "paused chatter",
        },
        {
          firstInterimAt: T0 + 19_000,
          finalAt: T0 + 22_000,
          text: "back again",
        },
      ],
      { clock, ...options },
    );
    expect(out?.segments).toEqual([
      { id: "s1", startMs: 9_600, endMs: 11_700, text: "back again" },
    ]);
  });

  it("returns null when nothing usable was said", () => {
    const clock = createSegmentClock({ startedAt: T0 });
    expect(buildTranscript([], { clock, ...options })).toBeNull();
    expect(
      buildTranscript(
        [{ firstInterimAt: T0, finalAt: T0 + 1_000, text: " " }],
        { clock, ...options },
      ),
    ).toBeNull();
  });
});
