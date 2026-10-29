import { describe, expect, it } from "vitest";
import {
  hydrateRecordingCaptureSource,
  hydrateRecordingClient,
  hydrateRecordingQualityId,
} from "./limits";

describe("recording capture metadata hydration", () => {
  it("keeps known values", () => {
    expect(hydrateRecordingClient("extension")).toBe("extension");
    expect(hydrateRecordingClient("desktop")).toBe("desktop");
    expect(hydrateRecordingClient("agent")).toBe("agent");
    expect(hydrateRecordingCaptureSource("tab")).toBe("tab");
    expect(hydrateRecordingCaptureSource("screen")).toBe("screen");
    expect(hydrateRecordingQualityId("saver")).toBe("saver");
    expect(hydrateRecordingQualityId("max")).toBe("max");
  });

  it("drops anything else to null", () => {
    expect(hydrateRecordingClient("web")).toBeNull();
    expect(hydrateRecordingClient(undefined)).toBeNull();
    expect(hydrateRecordingCaptureSource("monitor")).toBeNull();
    expect(hydrateRecordingCaptureSource(3)).toBeNull();
    expect(hydrateRecordingQualityId("4k")).toBeNull();
    expect(hydrateRecordingQualityId({})).toBeNull();
  });
});
