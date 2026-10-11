import { describe, expect, it } from "vitest";
import { formatPostDate } from "./format";

describe("formatPostDate", () => {
  it("formats the calendar date without shifting by timezone", () => {
    expect(formatPostDate("2026-10-11")).toBe("October 11, 2026");
    expect(formatPostDate("2026-01-01")).toBe("January 1, 2026");
  });
});
