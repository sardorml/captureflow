import { describe, expect, it } from "vitest";
import { buildRecordingHeadline, shareTitle } from "./title";

const AT = Date.UTC(2026, 9, 29, 12);

describe("buildRecordingHeadline", () => {
  it("names the source and the date", () => {
    expect(buildRecordingHeadline("Quarterly demo", AT)).toBe(
      "Quarterly demo — October 29, 2026",
    );
  });

  it("falls back to the product name", () => {
    expect(buildRecordingHeadline(null, AT)).toBe(
      "CaptureFlow recording — October 29, 2026",
    );
  });

  it("clips a very long source title", () => {
    expect(buildRecordingHeadline("x".repeat(500), AT).length).toBe(200);
  });
});

describe("shareTitle", () => {
  it("drops the date after the source title", () => {
    const title = buildRecordingHeadline("Record your screen — fast", AT);
    expect(shareTitle(title)).toBe("Record your screen — fast");
  });

  it("keeps the date when there is no source title", () => {
    expect(shareTitle(buildRecordingHeadline(null, AT))).toBe(
      "CaptureFlow recording — October 29, 2026",
    );
  });

  it("leaves a renamed title alone", () => {
    expect(shareTitle("Quarterly demo")).toBe("Quarterly demo");
  });
});
