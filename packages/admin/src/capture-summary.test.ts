import { describe, expect, it } from "vitest";
import { summarizeCapture } from "./capture-summary";

describe("summarizeCapture", () => {
  it("names the devices and where the mic went", () => {
    const summary = summarizeCapture(
      JSON.stringify({
        camera: { requested: false, acquired: false },
        mic: {
          requested: true,
          acquired: true,
          label: "MacBook Pro Microphone",
        },
        audio: {
          muxed: "aac",
          sampleRate: 48000,
          channelCount: 1,
          bitrate: 64000,
        },
        warnings: ["stream-recorder: output gap 300ms before 12.00s"],
      }),
    );
    expect(summary).toEqual({
      mic: "Mic: MacBook Pro Microphone · AAC 48 kHz",
      camera: "Camera off",
      warnings: ["stream-recorder: output gap 300ms before 12.00s"],
    });
  });

  it("says why a mic that was on left no audio track", () => {
    const summary = summarizeCapture(
      JSON.stringify({
        camera: {
          requested: true,
          acquired: true,
          label: "FaceTime HD Camera",
        },
        mic: { requested: true, acquired: true, label: "Headset" },
        audio: {
          muxed: "none",
          reason: "AAC encoding unavailable (16000 Hz, 1 ch)",
        },
      }),
    );
    expect(summary?.mic).toBe(
      "Mic: Headset · no audio track: AAC encoding unavailable (16000 Hz, 1 ch)",
    );
    expect(summary?.camera).toBe("Camera: FaceTime HD Camera");
    expect(summary?.warnings).toEqual([]);
  });

  it("marks a device the browser never handed over", () => {
    const summary = summarizeCapture(
      JSON.stringify({
        camera: { requested: true, acquired: false },
        mic: { requested: true, acquired: false },
        audio: { muxed: "none", reason: "no mic track" },
      }),
    );
    expect(summary?.mic).toBe(
      "Mic not acquired · no audio track: no mic track",
    );
    expect(summary?.camera).toBe("Camera not acquired");
  });

  it("returns null without a readable report", () => {
    expect(summarizeCapture(null)).toBeNull();
    expect(summarizeCapture("{nope")).toBeNull();
    expect(summarizeCapture("3")).toBeNull();
  });
});
