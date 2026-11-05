import { describe, expect, it } from "vitest";
import {
  hydrateCaptureReport,
  parseCaptureJson,
  trackHasAudio,
} from "./capture-report";

const report = {
  userAgent: "Mozilla/5.0 (Macintosh) Chrome/142",
  surface: "window",
  camera: { requested: false, acquired: false },
  mic: {
    requested: true,
    acquired: true,
    deviceId: "abc",
    label: "MacBook Pro Microphone",
    sampleRate: 48000,
    channelCount: 1,
  },
  audio: { muxed: "aac", sampleRate: 48000, channelCount: 1, bitrate: 64000 },
  warnings: ["stream-recorder: output gap 300ms before 12.00s"],
};

describe("hydrateCaptureReport", () => {
  it("keeps a well-formed report", () => {
    expect(hydrateCaptureReport(report)).toEqual(report);
  });

  it("keeps the reason a mic was left out", () => {
    const hydrated = hydrateCaptureReport({
      ...report,
      audio: {
        muxed: "none",
        reason: "AAC encoding unavailable (16000 Hz, 1 ch)",
      },
    });
    expect(hydrated?.audio).toEqual({
      muxed: "none",
      reason: "AAC encoding unavailable (16000 Hz, 1 ch)",
    });
  });

  it("drops a report missing a device or the audio outcome", () => {
    expect(hydrateCaptureReport(null)).toBeNull();
    expect(hydrateCaptureReport("mic")).toBeNull();
    expect(hydrateCaptureReport({ ...report, mic: undefined })).toBeNull();
    expect(
      hydrateCaptureReport({ ...report, audio: { muxed: "opus" } }),
    ).toBeNull();
    expect(
      hydrateCaptureReport({ ...report, audio: { muxed: "aac" } }),
    ).toBeNull();
  });

  it("caps text and the warning list", () => {
    const hydrated = hydrateCaptureReport({
      ...report,
      mic: { ...report.mic, label: "x".repeat(500) },
      warnings: [...Array.from({ length: 40 }, (_, i) => `w${i}`), 3, ""],
    });
    expect(hydrated?.mic.label).toHaveLength(200);
    expect(hydrated?.warnings).toHaveLength(20);
  });

  it("fills what the client left out", () => {
    const hydrated = hydrateCaptureReport({
      camera: { requested: true, acquired: false },
      mic: { requested: false, acquired: false },
      audio: { muxed: "none" },
    });
    expect(hydrated).toEqual({
      userAgent: "",
      surface: null,
      camera: { requested: true, acquired: false },
      mic: { requested: false, acquired: false },
      audio: { muxed: "none", reason: "unknown" },
      warnings: [],
    });
  });
});

describe("parseCaptureJson", () => {
  it("reads a stored report and survives bad JSON", () => {
    expect(parseCaptureJson(JSON.stringify(report))).toEqual(report);
    expect(parseCaptureJson("{nope")).toBeNull();
    expect(parseCaptureJson(null)).toBeNull();
  });
});

describe("trackHasAudio", () => {
  const withAudio = (audio: object) => ({ ...report, audio }) as never;

  it("follows where the mic was muxed", () => {
    const aac = withAudio(report.audio);
    expect(trackHasAudio(aac, "screen")).toBe(true);
    expect(trackHasAudio(aac, "webcam")).toBe(false);
    const webcam = withAudio({ muxed: "webcam" });
    expect(trackHasAudio(webcam, "screen")).toBe(false);
    expect(trackHasAudio(webcam, "webcam")).toBe(true);
    const none = withAudio({ muxed: "none", reason: "mic off" });
    expect(trackHasAudio(none, "screen")).toBe(false);
  });

  it("does not know without a report", () => {
    expect(trackHasAudio(null, "screen")).toBeNull();
  });
});
