import { describe, expect, it } from "vitest";
import {
  DEFAULT_RECORDING_CONFIG,
  hydrateRecordingConfig,
  parseRecordingConfigJson,
  recordingBackgroundImageFile,
} from "./recording-config";

describe("hydrateRecordingConfig", () => {
  it("falls back to the defaults for junk", () => {
    expect(hydrateRecordingConfig(null)).toEqual(DEFAULT_RECORDING_CONFIG);
    expect(parseRecordingConfigJson("{oops")).toEqual(DEFAULT_RECORDING_CONFIG);
    expect(hydrateRecordingConfig({ background: "red" }).background).toBe(
      "transparent",
    );
  });

  it("keeps valid fields and normalizes cuts", () => {
    expect(
      hydrateRecordingConfig({
        background: "violet",
        cameraCorner: "top-left",
        cameraPoint: { x: 0.25, y: 1.4 },
        cameraSize: "large",
        cameraHidden: true,
        micMuted: true,
        systemMuted: "yes",
        cuts: [
          { startMs: 3000, endMs: 4000 },
          { startMs: 1000, endMs: 2000 },
          { startMs: 1500, endMs: 1200 },
        ],
      }),
    ).toEqual({
      background: "violet",
      padding: 4,
      radius: 8,
      shadow: 50,
      cameraCorner: "top-left",
      cameraPoint: { x: 0.25, y: 1 },
      cameraSize: "large",
      cameraHidden: true,
      micMuted: true,
      systemMuted: false,
      cuts: [
        { startMs: 1000, endMs: 2000 },
        { startMs: 3000, endMs: 4000 },
      ],
    });
  });

  it("reads a legacy config without cuts or a camera flag", () => {
    const legacy = parseRecordingConfigJson(
      JSON.stringify({ background: "#fff" }),
    );
    expect(legacy.cuts).toEqual([]);
    expect(legacy.cameraHidden).toBe(false);
    expect(legacy.cameraPoint).toBe(null);
  });

  it("drops a camera point that isn't two finite numbers", () => {
    for (const bad of [{ x: "0.5", y: 0.5 }, { x: NaN, y: 0 }, [0.5, 0.5], 1]) {
      expect(hydrateRecordingConfig({ cameraPoint: bad }).cameraPoint).toBe(
        null,
      );
    }
  });

  it("clamps the frame to its limits and keeps the defaults for junk", () => {
    const config = hydrateRecordingConfig({
      padding: 40,
      radius: -3,
      shadow: "lots",
    });
    expect([config.padding, config.radius, config.shadow]).toEqual([15, 0, 50]);
    expect(hydrateRecordingConfig({ padding: 6.25 }).padding).toBe(6.3);
  });

  it("accepts an uploaded image background and nothing like a path", () => {
    const file = `${"a".repeat(32)}.webp`;
    expect(
      hydrateRecordingConfig({ background: `image:${file}` }).background,
    ).toBe(`image:${file}`);
    for (const bad of [
      "image:../secret.png",
      `image:${"a".repeat(32)}.svg`,
      `image:recordings/${file}`,
    ]) {
      expect(hydrateRecordingConfig({ background: bad }).background).toBe(
        "transparent",
      );
    }
    expect(recordingBackgroundImageFile("violet")).toBe(null);
  });
});
