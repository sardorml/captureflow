import { describe, expect, it } from "vitest";
import { ENGINE_OUTPUT } from "./contract";
import {
  DEFAULT_RECORDING_QUALITY,
  RECORDING_QUALITIES,
  RECORDING_QUALITY_IDS,
  estimateBytesPerMinute,
  hydrateRecordingQuality,
} from "./quality";

const MB = 1024 * 1024;

describe("recording quality", () => {
  it("matches the output contract at maximum", () => {
    const max = RECORDING_QUALITIES.max;
    expect(max.screen.maxWidth).toBe(ENGINE_OUTPUT.screen.maxWidth);
    expect(max.screen.fps).toBe(ENGINE_OUTPUT.screen.fps);
    expect(max.screen.bitrate).toBe(ENGINE_OUTPUT.screen.bitrate);
  });

  it("starts on data saver", () => {
    expect(DEFAULT_RECORDING_QUALITY).toBe("saver");
  });

  it("hydrates unknown values to the default", () => {
    expect(hydrateRecordingQuality("high")).toBe("high");
    expect(hydrateRecordingQuality("4k")).toBe(DEFAULT_RECORDING_QUALITY);
    expect(hydrateRecordingQuality(undefined)).toBe(DEFAULT_RECORDING_QUALITY);
  });

  it("orders the presets from cheapest to dearest", () => {
    const perMinute = RECORDING_QUALITY_IDS.map((id) =>
      estimateBytesPerMinute(RECORDING_QUALITIES[id], true),
    );
    for (let i = 1; i < perMinute.length; i++) {
      expect(perMinute[i]).toBeGreaterThan(perMinute[i - 1]!);
    }
  });

  it("lands near the measured ten-minute recording at maximum", () => {
    const max = RECORDING_QUALITIES.max;
    // 199 MB for 9m48s with the camera on.
    const perMinute = estimateBytesPerMinute(max, true) / MB;
    expect(perMinute).toBeGreaterThan(16);
    expect(perMinute).toBeLessThan(28);
    expect(estimateBytesPerMinute(max, false)).toBeLessThan(
      estimateBytesPerMinute(max, true),
    );
  });
});
