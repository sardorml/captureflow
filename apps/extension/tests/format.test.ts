import { describe, expect, it } from "vitest";
import { formatBytes, formatClock, uploadPercent } from "../lib/format";

describe("uploadPercent", () => {
  it("floors the ratio to a whole percent", () => {
    expect(uploadPercent(0, 100)).toBe(0);
    expect(uploadPercent(62_500, 100_000)).toBe(62);
    expect(uploadPercent(999, 1_000)).toBe(99);
  });

  // Finalize still runs after the last part, so 100% would sit there looking
  // stuck.
  it("caps at 99 even when every byte is uploaded", () => {
    expect(uploadPercent(1_000, 1_000)).toBe(99);
    expect(uploadPercent(2_000, 1_000)).toBe(99);
  });

  it("returns null without a known total", () => {
    expect(uploadPercent(500, undefined)).toBeNull();
    expect(uploadPercent(500, 0)).toBeNull();
    expect(uploadPercent(undefined, 1_000)).toBe(0);
  });
});

describe("formatClock", () => {
  it("renders mm:ss with zero-padded seconds", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(9_000)).toBe("0:09");
    expect(formatClock(65_000)).toBe("1:05");
    expect(formatClock(30 * 60 * 1000)).toBe("30:00");
  });

  it("clamps negatives to zero", () => {
    expect(formatClock(-5_000)).toBe("0:00");
  });

  // Nothing caps a recording's length, so the clock has to stay readable past
  // an hour rather than running the minutes up unbounded.
  it("grows an hours field once past an hour", () => {
    expect(formatClock(3_600_000)).toBe("1:00:00");
    expect(formatClock(3_600_000 + 65_000)).toBe("1:01:05");
    expect(formatClock(2 * 3_600_000 + 7_000)).toBe("2:00:07");
    expect(formatClock(59 * 60_000 + 59_000)).toBe("59:59");
  });
});

describe("formatBytes", () => {
  it("renders bytes under 1 KiB without a decimal", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
  });

  it("renders kilobytes with one decimal", () => {
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("renders megabytes with one decimal", () => {
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
  });

  it("steps up to gigabytes", () => {
    expect(formatBytes(3 * 1024 * 1024 * 1024)).toBe("3.0 GB");
  });
});
