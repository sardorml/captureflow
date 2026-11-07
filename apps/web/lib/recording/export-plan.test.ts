import { describe, expect, it } from "vitest";
import {
  bubbleRect,
  coverRect,
  editedDuration,
  exportCanvas,
  frameLayout,
  gradientLine,
  keptSegments,
  mixInto,
  needsRender,
  sourceTimeAt,
} from "./export-plan";
import { DEFAULT_RECORDING_CONFIG } from "@/lib/recording-config";

describe("keptSegments", () => {
  it("keeps everything outside the cuts", () => {
    const segments = keptSegments(10, [
      { startMs: 2000, endMs: 3000 },
      { startMs: 8000, endMs: 12000 },
    ]);
    expect(segments).toEqual([
      { srcStart: 0, srcEnd: 2, outStart: 0 },
      { srcStart: 3, srcEnd: 8, outStart: 2 },
    ]);
    expect(editedDuration(segments)).toBe(7);
  });

  it("drops a cut at the very start", () => {
    expect(keptSegments(5, [{ startMs: 0, endMs: 1000 }])).toEqual([
      { srcStart: 1, srcEnd: 5, outStart: 0 },
    ]);
  });

  it("maps edited time back to the recording", () => {
    const segments = keptSegments(10, [{ startMs: 2000, endMs: 3000 }]);
    expect(sourceTimeAt(1, segments)).toBe(1);
    expect(sourceTimeAt(2, segments)).toBe(3);
    expect(sourceTimeAt(4.5, segments)).toBe(5.5);
    expect(sourceTimeAt(99, segments)).toBe(10);
  });
});

describe("layout", () => {
  it("insets the frame by the padding on each axis", () => {
    const { rect, radius, shadow } = frameLayout(1000, 500, {
      padding: 10,
      radius: 20,
      shadow: 50,
    });
    expect(rect).toEqual({ x: 100, y: 50, width: 800, height: 400 });
    expect(radius).toBe(20);
    expect(shadow).toEqual({ offsetY: 20, blur: 60, spread: -20, alpha: 0.5 });
  });

  it("puts a corner bubble the same distance in from both edges", () => {
    expect(
      bubbleRect(1000, 500, {
        corner: "bottom-right",
        point: null,
        size: "medium",
      }),
    ).toEqual({ x: 815, y: 315, width: 160, height: 160 });
  });

  it("keeps a dragged bubble inside the frame", () => {
    const r = bubbleRect(1000, 500, {
      corner: "top-left",
      point: { x: 0.99, y: 0 },
      size: "small",
    });
    expect(r).toEqual({ x: 880, y: 0, width: 120, height: 120 });
  });

  it("runs a 135deg gradient corner to corner on a square", () => {
    const l = gradientLine(100, 100, 135);
    expect(l.x0).toBeCloseTo(0);
    expect(l.y0).toBeCloseTo(0);
    expect(l.x1).toBeCloseTo(100);
    expect(l.y1).toBeCloseTo(100);
  });

  it("covers a box with an image", () => {
    expect(
      coverRect(200, 100, { x: 0, y: 0, width: 100, height: 100 }),
    ).toEqual({ x: -50, y: 0, width: 200, height: 100 });
  });
});

describe("exportCanvas", () => {
  it("keeps the recording at its own size inside the padding", () => {
    expect(exportCanvas(1920, 1080, 4, true)).toEqual({
      width: 2086,
      height: 1174,
      rect: { x: 83, y: 47, width: 1920, height: 1080 },
    });
    expect(exportCanvas(1919, 1080, 4, false).rect).toEqual({
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
    });
  });
});

describe("needsRender", () => {
  it("skips rendering an unedited recording without a camera", () => {
    expect(needsRender(DEFAULT_RECORDING_CONFIG, false)).toBe(false);
    expect(needsRender(DEFAULT_RECORDING_CONFIG, true)).toBe(true);
    expect(
      needsRender({ ...DEFAULT_RECORDING_CONFIG, background: "violet" }, false),
    ).toBe(true);
  });
});

describe("mixInto", () => {
  it("tiles back-to-back buffers without a missing sample", () => {
    const rate = 48_000;
    const size = 1024;
    const out = [new Float32Array(rate)];
    const segment = { srcStart: 0.0123, srcEnd: 2, outStart: 0 };
    for (let b = 0; b < 60; b++) {
      mixInto(
        out,
        rate,
        0,
        {
          channels: [new Float32Array(size).fill(1)],
          sampleRate: rate,
          timestamp: (b * size) / rate,
        },
        segment,
      );
    }
    expect(out[0]!.every((v) => v === 1)).toBe(true);
  });

  it("places samples through a segment and sums sources", () => {
    const out = [new Float32Array(4)];
    const segment = { srcStart: 2, srcEnd: 4, outStart: 0 };
    const source = {
      channels: [Float32Array.from([1, 1, 1, 1, 2, 2, 2, 2])],
      sampleRate: 2,
      timestamp: 0,
    };
    mixInto(out, 2, 0, source, segment);
    mixInto(out, 2, 0, source, segment);
    expect(Array.from(out[0]!)).toEqual([4, 4, 4, 4]);
  });

  it("fades the ends that meet a cut", () => {
    const out = [new Float32Array(480)];
    mixInto(
      out,
      48_000,
      0,
      {
        channels: [new Float32Array(480).fill(1)],
        sampleRate: 48_000,
        timestamp: 0,
      },
      { srcStart: 0, srcEnd: 0.01, outStart: 0 },
      { in: true, out: true },
    );
    expect(out[0]![0]).toBeCloseTo(1 / 240);
    expect(out[0]![239]).toBe(1);
    expect(out[0]![479]).toBeCloseTo(1 / 240);
  });

  it("fills both channels from a mono source and respects the window", () => {
    const out = [new Float32Array(2), new Float32Array(2)];
    const segment = { srcStart: 0, srcEnd: 4, outStart: 0 };
    mixInto(
      out,
      1,
      2,
      {
        channels: [Float32Array.from([0, 1, 2, 3])],
        sampleRate: 1,
        timestamp: 0,
      },
      segment,
    );
    expect(Array.from(out[0]!)).toEqual([2, 3]);
    expect(Array.from(out[1]!)).toEqual([2, 3]);
  });
});
