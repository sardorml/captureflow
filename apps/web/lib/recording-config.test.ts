import { describe, expect, it } from "vitest";
import {
  DEFAULT_RECORDING_CONFIG,
  hydrateRecordingConfig,
  parseRecordingConfigJson,
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
        cameraSize: "large",
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
      cameraCorner: "top-left",
      cameraSize: "large",
      micMuted: true,
      systemMuted: false,
      cuts: [
        { startMs: 1000, endMs: 2000 },
        { startMs: 3000, endMs: 4000 },
      ],
    });
  });

  it("reads a legacy config without cuts", () => {
    expect(
      parseRecordingConfigJson(JSON.stringify({ background: "#fff" })).cuts,
    ).toEqual([]);
  });
});
