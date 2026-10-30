import { describe, expect, it } from "vitest";
import { buildRecordingHeadline, shareTitle } from "./title";

const AT = Date.UTC(2026, 9, 29, 12);

describe("shareTitle", () => {
  it("drops the brand line and date after the source title", () => {
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
