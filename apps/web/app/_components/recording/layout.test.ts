import { describe, expect, it } from "vitest";
import {
  aspectFromPlaceholder,
  recordingBackgroundStyle,
  sizeStyleForAspect,
  webcamCornerClass,
  webcamSizeClass,
} from "./layout";

describe("aspectFromPlaceholder", () => {
  it("falls back to 16:10 when dimensions are missing", () => {
    expect(aspectFromPlaceholder(null, null)).toBeCloseTo(1.6);
    expect(aspectFromPlaceholder(0, 720)).toBeCloseTo(1.6);
  });

  it("treats the legacy 1280x720 placeholder as 16:10", () => {
    expect(aspectFromPlaceholder(1280, 720)).toBeCloseTo(1.6);
  });

  it("trusts any other server dimension", () => {
    expect(aspectFromPlaceholder(1920, 1080)).toBeCloseTo(16 / 9);
    expect(aspectFromPlaceholder(1080, 1920)).toBeCloseTo(9 / 16);
  });
});

describe("sizeStyleForAspect", () => {
  it("fills the column for landscape sources without a cap", () => {
    expect(sizeStyleForAspect(16 / 9)).toEqual({
      width: "100%",
      aspectRatio: 16 / 9,
    });
  });

  it("derives width from the capped height for landscape sources", () => {
    const style = sizeStyleForAspect(1.6, "min(34rem, 50vh)");
    expect(style.aspectRatio).toBe(1.6);
    expect(style.width).toBe("min(100%, calc(min(34rem, 50vh) * 1.6))");
  });

  it("caps height and centers squarish and portrait sources", () => {
    const style = sizeStyleForAspect(1);
    expect(style.aspectRatio).toBe(1);
    expect(style.height).toContain("31.5rem");
    expect(style.width).toContain("clamp(");
  });

  it("falls back to 16:9 for a non-finite aspect", () => {
    expect(sizeStyleForAspect(Number.NaN).aspectRatio).toBeCloseTo(16 / 9);
    expect(sizeStyleForAspect(0).aspectRatio).toBeCloseTo(16 / 9);
  });
});

describe("webcam classes", () => {
  it("maps every corner and size", () => {
    expect(webcamCornerClass("top-left")).toBe("top-6 left-6");
    expect(webcamCornerClass("bottom-right")).toBe("bottom-6 right-6");
    expect(webcamSizeClass("small")).toContain("w-[12%]");
    expect(webcamSizeClass("large")).toContain("w-[22%]");
  });
});

describe("recordingBackgroundStyle", () => {
  it("is empty for transparent and unknown values", () => {
    expect(recordingBackgroundStyle("transparent")).toEqual({});
    expect(recordingBackgroundStyle("nope")).toEqual({});
  });

  it("paints hex colors and gradient presets", () => {
    expect(recordingBackgroundStyle("#123456")).toEqual({
      backgroundColor: "#123456",
    });
    expect(recordingBackgroundStyle("violet").background).toContain(
      "linear-gradient(",
    );
  });
});
