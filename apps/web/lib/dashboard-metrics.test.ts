import { describe, expect, it } from "vitest";
import { formatRecordedTime } from "./dashboard-metrics";

describe("formatRecordedTime", () => {
  it("says minutes under an hour and hours past it", () => {
    expect(formatRecordedTime(0)).toBe("0 min");
    expect(formatRecordedTime(45 * 60_000)).toBe("45 min");
    expect(formatRecordedTime(120 * 60_000)).toBe("2 h");
    expect(formatRecordedTime(135 * 60_000 + 20_000)).toBe("2 h 15 min");
  });
});
