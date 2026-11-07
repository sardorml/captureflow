import { describe, expect, it } from "vitest";
import { musicTempoCommands } from "./music";
import { TEMPO_RATIO, tempoAt, tempoWarp, type TempoRamp } from "./tempo";

const ramp: TempoRamp = { rampFromMs: 4_000, rampToMs: 50_000 };

describe("tempoAt", () => {
  it("holds, rises smoothly to four times, and holds there", () => {
    expect(tempoAt(0, ramp)).toBe(1);
    expect(tempoAt(4_000, ramp)).toBe(1);
    expect(tempoAt(27_000, ramp)).toBeCloseTo(2, 5);
    expect(tempoAt(50_000, ramp)).toBe(TEMPO_RATIO);
    expect(tempoAt(79_000, ramp)).toBe(TEMPO_RATIO);
    let last = 1;
    for (let ms = 0; ms <= 80_000; ms += 250) {
      const t = tempoAt(ms, ramp);
      expect(t).toBeGreaterThanOrEqual(last);
      expect(t - last).toBeLessThan(0.05);
      last = t;
    }
  });
});

describe("musicTempoCommands", () => {
  it("places each speed where its step starts in the file", () => {
    const { commands: cmds, sourceSeconds } = musicTempoCommands({
      ...ramp,
      lengthMs: 80_000,
    });
    expect(cmds[0]).toEqual({ at: 0, tempo: 1 });
    for (let i = 1; i < cmds.length; i++) {
      expect(cmds[i]!.at).toBeGreaterThan(cmds[i - 1]!.at);
    }
    expect(cmds.find((c) => c.at >= 4)!.tempo).toBeCloseTo(1, 2);
    const end = cmds[cmds.length - 1]!;
    expect(end.tempo).toBe(TEMPO_RATIO);
    expect(end.at).toBeGreaterThan(4 + 30 * 4);
    // The file is consumed at the speeds played, so the stretched 80 s takes more than 80 s of it.
    expect(sourceSeconds).toBeGreaterThan(end.at);
    expect(sourceSeconds).toBeGreaterThan(80);
  });
});

describe("tempoWarp", () => {
  it("keeps the ends, stays in order, and gives the slow start more time", () => {
    const warp = tempoWarp(5_000, 65_000, ramp);
    expect(warp(5_000)).toBe(5_000);
    expect(warp(65_000)).toBe(65_000);
    let last = 5_000;
    for (let ms = 5_000; ms <= 65_000; ms += 500) {
      const w = warp(ms);
      expect(w).toBeGreaterThanOrEqual(last);
      last = w;
    }
    // The first tenth of the work happens while the music is slow, so it takes longer than a tenth of the time.
    expect(warp(11_000) - 5_000).toBeGreaterThan(6_000 * 2);
    // The last tenth happens at full speed and goes by quickly.
    expect(65_000 - warp(59_000)).toBeLessThan(6_000 * 0.7);
  });
});
