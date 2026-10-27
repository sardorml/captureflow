import { describe, expect, it } from "vitest";
import {
  clampQuality,
  exceedsQuality,
  hydrateRecordingLimits,
} from "../lib/capture/quality-limits";

describe("quality limits", () => {
  it("lowers a preset above the cap and leaves the rest alone", () => {
    expect(clampQuality("max", "saver")).toBe("saver");
    expect(clampQuality("saver", "saver")).toBe("saver");
    expect(clampQuality("low", "balanced")).toBe("low");
    expect(clampQuality("max", null)).toBe("max");
  });

  it("only a declared higher preset exceeds the cap", () => {
    expect(exceedsQuality("high", "saver")).toBe(true);
    expect(exceedsQuality("saver", "saver")).toBe(false);
    expect(exceedsQuality("max", null)).toBe(false);
  });

  it("reads the probe defensively", () => {
    expect(
      hydrateRecordingLimits({
        tier: "free",
        maxQuality: "saver",
        maxDurationMs: 300_000,
      }),
    ).toEqual({ tier: "free", maxQuality: "saver", maxDurationMs: 300_000 });
    expect(
      hydrateRecordingLimits({
        tier: "team",
        maxQuality: null,
        maxDurationMs: null,
      }),
    ).toEqual({ tier: "team", maxQuality: null, maxDurationMs: null });
    expect(
      hydrateRecordingLimits({
        tier: "pro",
        maxQuality: "ultra",
        maxDurationMs: -1,
      }),
    ).toEqual({ tier: "free", maxQuality: null, maxDurationMs: null });
  });
});
