import { describe, expect, it } from "vitest";
import { isCanvasUrl } from "../lib/overlay/canvas-url";

const CANVAS = "https://captureflow.dev/canvas";

describe("isCanvasUrl", () => {
  it("matches the canvas with or without a query or hash", () => {
    expect(isCanvasUrl(CANVAS, CANVAS)).toBe(true);
    expect(isCanvasUrl(`${CANVAS}?from=dashboard`, CANVAS)).toBe(true);
    expect(isCanvasUrl(`${CANVAS}#board`, CANVAS)).toBe(true);
    expect(isCanvasUrl(`${CANVAS}/`, CANVAS)).toBe(true);
  });

  it("ignores other pages and lookalike paths", () => {
    expect(isCanvasUrl("https://captureflow.dev/canvasses", CANVAS)).toBe(
      false,
    );
    expect(isCanvasUrl("https://captureflow.dev/recordings", CANVAS)).toBe(
      false,
    );
    expect(isCanvasUrl(undefined, CANVAS)).toBe(false);
  });
});
