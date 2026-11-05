import { describe, expect, it } from "vitest";
import { formatRecordedTime } from "./dashboard-metrics";
import { LIBRARY } from "./i18n/app/en/library";

const FORMS = LIBRARY.dashboard.recordedTime;

describe("formatRecordedTime", () => {
  it("says minutes under an hour and hours past it", () => {
    expect(formatRecordedTime(0, FORMS)).toBe("0 min");
    expect(formatRecordedTime(45 * 60_000, FORMS)).toBe("45 min");
    expect(formatRecordedTime(120 * 60_000, FORMS)).toBe("2 h");
    expect(formatRecordedTime(135 * 60_000 + 20_000, FORMS)).toBe("2 h 15 min");
  });
});
