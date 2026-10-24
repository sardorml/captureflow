import { describe, expect, it } from "vitest";
import {
  RECORDING_BUBBLE_SIZE,
  recordingWindowSize,
} from "@/lib/overlay/recording-window";

describe("recordingWindowSize", () => {
  it("is a square with room around the bubble", () => {
    const { width, height } = recordingWindowSize();
    expect(width).toBe(height);
    expect(width).toBeGreaterThan(RECORDING_BUBBLE_SIZE);
    expect(width).toBeLessThan(RECORDING_BUBBLE_SIZE * 1.25);
  });
});
