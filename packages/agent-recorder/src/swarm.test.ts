import { describe, expect, it } from "vitest";
import { planSwarm, swarmSeconds, type SwarmUnit } from "./swarm";

const text = (y: number, chars: number, x = 100): SwarmUnit => ({
  kind: "text",
  x,
  y,
  w: 400,
  h: 24,
  lines: 1,
  chars,
});
const page: SwarmUnit[] = [
  { kind: "frame", x: 0, y: 0, w: 1000, h: 300, lines: 1, chars: 1 },
  text(0, 20),
  { kind: "media", x: 600, y: 0, w: 300, h: 200, lines: 1, chars: 1 },
  text(100, 80),
  { kind: "box", x: 100, y: 160, w: 120, h: 40, lines: 1, chars: 1 },
  text(900, 200),
  text(950, 10, 500),
];

describe("swarmSeconds", () => {
  it("gives a short page a short build and a tall one up to 60 s", () => {
    expect(swarmSeconds(20, 1)).toBe(12);
    expect(swarmSeconds(250, 4)).toBe(25);
    expect(swarmSeconds(100, 10)).toBe(32);
    expect(swarmSeconds(900, 30)).toBe(60);
  });
});

describe("planSwarm", () => {
  it("gives every element one job, inside the recording's time", () => {
    const plan = planSwarm(page, { agents: 3, durationMs: 12_000, seed: 1 });
    expect(plan.tasks.map((t) => t.unit).sort()).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(plan.agents).toBe(3);
    const frame = plan.tasks.find((t) => t.unit === 0)!;
    expect(plan.tasks.every((t) => t.start >= frame.start)).toBe(true);
    for (const t of plan.tasks) {
      expect(t.start).toBeGreaterThanOrEqual(plan.introMs);
      expect(t.end).toBeLessThanOrEqual(plan.durationMs - plan.outroMs + 1);
      expect(t.end).toBeGreaterThan(t.start);
    }
  });

  it("works top to bottom and never more agents than elements", () => {
    const plan = planSwarm(page, { agents: 40, durationMs: 20_000, seed: 7 });
    expect(plan.agents).toBe(page.length);
    const startOf = (unit: number) =>
      plan.tasks.find((t) => t.unit === unit)!.start;
    const lastOnTop = Math.max(startOf(1), startOf(2), startOf(3), startOf(4));
    const firstBelow = Math.min(startOf(5), startOf(6));
    expect(firstBelow).toBeGreaterThan(lastOnTop);
  });

  it("keeps the work going on at once within most of a screen", () => {
    const tall: SwarmUnit[] = [];
    for (let y = 0; y < 6000; y += 60) tall.push(text(y, 30), text(y, 30, 600));
    const plan = planSwarm(tall, {
      agents: 24,
      durationMs: 30_000,
      seed: 2,
      screen: 600,
    });
    for (const a of plan.tasks) {
      for (const b of plan.tasks) {
        if (a.start < b.end && b.start < a.end) {
          expect(
            Math.abs(tall[a.unit]!.y - tall[b.unit]!.y),
          ).toBeLessThanOrEqual(600 * 0.5);
        }
      }
    }
    // A wait for the band is spent at the last job, not stretched over the trip.
    const byAgent = new Map<number, typeof plan.tasks>();
    for (const t of plan.tasks) {
      byAgent.set(t.agent, [...(byAgent.get(t.agent) ?? []), t]);
    }
    for (const list of byAgent.values()) {
      list.sort((a, b) => a.start - b.start);
      for (let i = 0; i < list.length; i++) {
        const t = list[i]!;
        expect(t.go).toBeLessThanOrEqual(t.start);
        expect(t.start - t.go).toBeLessThanOrEqual(900 * 2);
        if (i > 0) expect(t.go).toBeGreaterThanOrEqual(list[i - 1]!.end);
      }
    }
    const loose = planSwarm(tall, { agents: 24, durationMs: 30_000, seed: 2 });
    const spread = (p: typeof plan) =>
      Math.max(
        ...p.tasks.map((a) =>
          Math.max(
            ...p.tasks
              .filter((b) => a.start < b.end && b.start < a.end)
              .map((b) => Math.abs(tall[a.unit]!.y - tall[b.unit]!.y)),
          ),
        ),
      );
    expect(spread(loose)).toBeGreaterThan(spread(plan));
  });

  it("puts a typed prompt before the agents and adds its time to the build", () => {
    const bare = planSwarm(page, { agents: 3, durationMs: 12_000, seed: 1 });
    const asked = planSwarm(page, {
      agents: 3,
      durationMs: 12_000,
      seed: 1,
      prompt: " Rebuild example.com ",
    });
    expect(bare.prompt).toBeNull();
    const pr = asked.prompt!;
    expect(pr.text).toBe("Rebuild example.com");
    expect(pr.at).toHaveLength(19);
    expect(pr.at.every((t, i) => i === 0 || t > pr.at[i - 1]!)).toBe(true);
    expect(pr.at[8]! - pr.at[7]!).toBeGreaterThan(pr.at[6]! - pr.at[5]!);
    expect(pr.sendAt).toBe(pr.at[18]! + pr.holdMs);
    expect(pr.ms).toBe(pr.sendAt + pr.sendMs);
    expect(asked.introMs).toBe(bare.introMs + pr.ms);
    expect(asked.durationMs).toBe(bare.durationMs + pr.ms);
    expect(Math.min(...asked.tasks.map((t) => t.start))).toBeGreaterThanOrEqual(
      asked.introMs,
    );
  });

  it("follows the music when asked: slow at first, fast at the end", () => {
    const even = planSwarm(page, { agents: 1, durationMs: 40_000, seed: 3 });
    const timed = planSwarm(page, {
      agents: 1,
      durationMs: 40_000,
      seed: 3,
      tempo: true,
    });
    expect(even.tempo).toBeNull();
    expect(timed.tempo).toEqual({
      rampFromMs: 0,
      rampToMs: timed.introMs + (40_000 - timed.introMs - timed.outroMs) * 0.9,
    });
    const first = (p: typeof even) => p.tasks.find((t) => t.unit === 0)!;
    const last = (p: typeof even) => p.tasks.find((t) => t.unit === 6)!;
    const length = (t: { start: number; end: number }) => t.end - t.start;
    expect(length(first(timed))).toBeGreaterThan(length(first(even)) * 2);
    expect(length(last(timed))).toBeLessThan(length(last(even)) * 0.7);
    expect(Math.max(...timed.tasks.map((t) => t.end))).toBeLessThanOrEqual(
      timed.durationMs - timed.outroMs + 1,
    );
    for (const t of timed.tasks) expect(t.end).toBeGreaterThan(t.start);
  });

  it("spends longer on more words and repeats for the same seed", () => {
    const a = planSwarm(page, { agents: 1, durationMs: 30_000, seed: 3 });
    const b = planSwarm(page, { agents: 1, durationMs: 30_000, seed: 3 });
    expect(a).toEqual(b);
    const span = (unit: number) => {
      const t = a.tasks.find((x) => x.unit === unit)!;
      return t.end - t.start;
    };
    expect(span(5)).toBeGreaterThan(span(1));
  });
});
