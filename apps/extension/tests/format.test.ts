import { describe, expect, it } from "vitest";
import { formatBytes, formatClock } from "../lib/format";

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
