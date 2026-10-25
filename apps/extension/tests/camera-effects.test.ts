import { describe, expect, it } from "vitest";
import {
  CAMERA_BACKGROUND_IDS,
  DEFAULT_CAMERA_EFFECT,
  cameraBackgroundCss,
  hydrateCameraEffect,
  isPlainCameraEffect,
} from "../lib/capture/camera-effects";

describe("camera effects", () => {
  it("hydrates a saved effect and falls back field by field", () => {
    expect(hydrateCameraEffect({ background: "blur", filter: "warm" })).toEqual(
      { background: "blur", filter: "warm" },
    );
    expect(
      hydrateCameraEffect({ background: "plaid", filter: "warm" }),
    ).toEqual({ background: "none", filter: "warm" });
    for (const junk of [undefined, null, "blur", 3, []]) {
      expect(hydrateCameraEffect(junk)).toEqual(DEFAULT_CAMERA_EFFECT);
    }
  });

  it("knows when nothing needs processing", () => {
    expect(isPlainCameraEffect(DEFAULT_CAMERA_EFFECT)).toBe(true);
    expect(isPlainCameraEffect({ background: "none", filter: "mono" })).toBe(
      false,
    );
    expect(isPlainCameraEffect({ background: "blur", filter: "none" })).toBe(
      false,
    );
  });

  it("paints colours and gradients, nothing for none and blur", () => {
    expect(cameraBackgroundCss("none")).toBe("");
    expect(cameraBackgroundCss("blur")).toBe("");
    expect(cameraBackgroundCss("royal")).toMatch(/^#/);
    expect(cameraBackgroundCss("ocean")).toContain("linear-gradient");
    expect(CAMERA_BACKGROUND_IDS.slice(0, 2)).toEqual(["none", "blur"]);
  });
});
