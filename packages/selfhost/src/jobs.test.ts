import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { cronMatches } from "./cron";
import { createLocalQueue, type QueueOutcome } from "./queue";
import { toWorkersAiOutput } from "./whisper";

describe("cronMatches", () => {
  it("matches the hourly and daily schedules in UTC", () => {
    expect(cronMatches("0 * * * *", new Date("2026-01-01T07:00:00Z"))).toBe(
      true,
    );
    expect(cronMatches("0 * * * *", new Date("2026-01-01T07:01:00Z"))).toBe(
      false,
    );
    expect(cronMatches("0 4 * * *", new Date("2026-01-01T04:00:30Z"))).toBe(
      true,
    );
    expect(cronMatches("0 4 * * *", new Date("2026-01-01T05:00:00Z"))).toBe(
      false,
    );
  });
});

describe("toWorkersAiOutput", () => {
  it("folds OpenAI's top-level words into their segments", () => {
    const out = toWorkersAiOutput({
      text: "Hi there. Bye.",
      segments: [
        { start: 0, end: 1.5, text: "Hi there." },
        { start: 1.5, end: 2, text: "Bye." },
      ],
      words: [
        { word: "Hi", start: 0, end: 0.4 },
        { word: "there.", start: 0.5, end: 1.2 },
        { word: "Bye.", start: 1.6, end: 1.9 },
      ],
    });
    expect(out.segments.map((s) => s.words?.map((w) => w.word))).toEqual([
      ["Hi", "there."],
      ["Bye."],
    ]);
  });

  it("tolerates junk", () => {
    expect(toWorkersAiOutput(null)).toEqual({ text: "", segments: [] });
    expect(toWorkersAiOutput({ segments: [{ start: "x" }] }).segments).toEqual(
      [],
    );
  });
});

describe("createLocalQueue", () => {
  it("acks, retries with the attempt count, and persists across instances", async () => {
    vi.useFakeTimers();
    const path = join(mkdtempSync(join(tmpdir(), "cf-q-")), "jobs.sqlite");
    const seen: [string, number][] = [];
    const consume = async (
      body: { id: string },
      attempts: number,
    ): Promise<QueueOutcome> => {
      seen.push([body.id, attempts]);
      return body.id === "flaky" && attempts < 2
        ? { retryDelaySeconds: 30 }
        : "ack";
    };

    const first = createLocalQueue(path, consume);
    await first.producer.sendBatch([
      { body: { id: "ok" } },
      { body: { id: "flaky" } },
    ]);
    await first.stop();

    const second = createLocalQueue(path, consume);
    second.start();
    await vi.advanceTimersByTimeAsync(1_100);
    expect(seen).toEqual([
      ["ok", 1],
      ["flaky", 1],
    ]);
    await vi.advanceTimersByTimeAsync(31_000);
    expect(seen).toContainEqual(["flaky", 2]);
    seen.length = 0;
    await vi.advanceTimersByTimeAsync(120_000);
    expect(seen).toEqual([]);
    await second.stop();
    vi.useRealTimers();
  });
});
