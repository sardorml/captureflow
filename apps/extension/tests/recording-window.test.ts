import { describe, expect, it } from "vitest";
import {
  RECORDING_BUBBLE_SIZE,
  recordingWindowSize,
} from "@/lib/overlay/recording-window";

describe("recordingWindowSize", () => {
  it("fits the bubble with a line of text under it", () => {
    const { width, height } = recordingWindowSize();
    expect(width).toBeGreaterThan(RECORDING_BUBBLE_SIZE);
    expect(width).toBeLessThan(RECORDING_BUBBLE_SIZE * 1.25);
    expect(height).toBeGreaterThan(width);
    expect(height).toBeLessThan(width + 40);
  });
});
