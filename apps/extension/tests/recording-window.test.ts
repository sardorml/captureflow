import { describe, expect, it } from "vitest";
import {
  RECORDING_BUBBLE_SIZE,
  recordingWindowSize,
} from "@/lib/overlay/recording-window";

describe("recordingWindowSize", () => {
  it("fits the bar beside the bubble with the camera on", () => {
    const { width, height } = recordingWindowSize(true);
    expect(height).toBe(RECORDING_BUBBLE_SIZE + 24);
    expect(width).toBeGreaterThan(RECORDING_BUBBLE_SIZE + 58);
  });

  it("is a narrow column with the camera off", () => {
    const { width, height } = recordingWindowSize(false);
    expect(width).toBeLessThan(RECORDING_BUBBLE_SIZE);
    expect(height).toBeGreaterThan(width);
  });
});
