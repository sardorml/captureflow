import { describe, expect, it } from "vitest";
import {
  aspectFromPlaceholder,
  fitStageSize,
  recordingBackgroundStyle,
  sizeStyleForAspect,
  clampWebcamPoint,
  webcamCornerClass,
  webcamCornerNear,
  webcamCornerPoint,
  webcamPointStyle,
  webcamSizeCss,
  webcamSizeFraction,
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

describe("fitStageSize", () => {
  it("is limited by width in a tall box and by height in a wide box", () => {
    expect(fitStageSize(800, 1000, 1.6)).toEqual({ width: 800, height: 500 });
    expect(fitStageSize(1240, 736, 1.6)).toEqual({
      width: 736 * 1.6,
      height: 736,
    });
  });

  it("fills a box of the same aspect", () => {
    expect(fitStageSize(1600, 1000, 1.6)).toEqual({
      width: 1600,
      height: 1000,
    });
  });
});

describe("webcam placement", () => {
  it("maps every corner and size", () => {
    expect(webcamCornerClass("top-left")).toBe("top-6 left-6");
    expect(webcamCornerClass("bottom-right")).toBe("bottom-6 right-6");
    expect(webcamSizeCss("small")).toBe("clamp(80px, 12cqw, 140px)");
    expect(webcamSizeCss("large")).toBe("clamp(150px, 22cqw, 280px)");
  });

  it("drops the pixel floor for a fluid bubble", () => {
    expect(webcamSizeCss("medium", true)).toBe("16cqw");
    expect(webcamPointStyle({ x: 0.5, y: 0.5 }, "medium", true).left).toBe(
      "clamp(0px, calc(50% - 16cqw / 2), calc(100% - 16cqw))",
    );
  });

  it("centres a free point and keeps the bubble inside the box", () => {
    const w = webcamSizeCss("medium");
    expect(webcamPointStyle({ x: 0.25, y: 1 }, "medium")).toEqual({
      left: `clamp(0px, calc(25% - ${w} / 2), calc(100% - ${w}))`,
      top: `clamp(0px, calc(100% - ${w} / 2), calc(100% - ${w}))`,
    });
  });

  it("clamps a dragged centre by the bubble's half size", () => {
    const half = { x: 0.1, y: 0.2 };
    expect(clampWebcamPoint({ x: 0.02, y: 0.5 }, half)).toEqual({
      x: 0.1,
      y: 0.5,
    });
    expect(clampWebcamPoint({ x: 0.5, y: 0.95 }, half)).toEqual({
      x: 0.5,
      y: 0.8,
    });
    expect(clampWebcamPoint({ x: 0.1, y: 0.1 }, { x: 0.6, y: 0.6 })).toEqual({
      x: 0.5,
      y: 0.5,
    });
  });

  it("pictures a corner as a centre point inset from that corner", () => {
    const half = { x: 0.08, y: 0.14 };
    const topLeft = webcamCornerPoint("top-left", half);
    expect(topLeft.x).toBeCloseTo(0.12);
    expect(topLeft.y).toBeCloseTo(0.18);
    const bottomRight = webcamCornerPoint("bottom-right", half);
    expect(bottomRight.x).toBeCloseTo(0.88);
    expect(bottomRight.y).toBeCloseTo(0.82);
    expect(webcamSizeFraction("medium")).toBe(0.16);
  });

  it("snaps a centre let go next to a corner onto that corner", () => {
    const half = { x: 0.08, y: 0.14 };
    expect(webcamCornerNear({ x: 0.14, y: 0.2 }, half)).toBe("top-left");
    expect(webcamCornerNear({ x: 0.86, y: 0.8 }, half)).toBe("bottom-right");
    expect(webcamCornerNear({ x: 0.5, y: 0.5 }, half)).toBe(null);
    expect(webcamCornerNear({ x: 0.2, y: 0.2 }, half)).toBe(null);
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
