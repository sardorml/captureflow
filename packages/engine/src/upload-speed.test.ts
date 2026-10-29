import { describe, expect, it } from "vitest";
import { blendUploadSpeed, outpacesUpload } from "./upload-speed";

const DAY = 24 * 60 * 60 * 1000;

describe("blendUploadSpeed", () => {
  it("takes the first reading as is", () => {
    expect(blendUploadSpeed(null, 2_000_000, 5)).toEqual({
      bitsPerSecond: 2_000_000,
      measuredAt: 5,
    });
  });

  it("moves halfway toward a new reading", () => {
    const prev = { bitsPerSecond: 10_000_000, measuredAt: 0 };
    expect(blendUploadSpeed(prev, 2_000_000, DAY).bitsPerSecond).toBe(
      6_000_000,
    );
  });

  it("drops a reading from last month", () => {
    const prev = { bitsPerSecond: 10_000_000, measuredAt: 0 };
    expect(blendUploadSpeed(prev, 2_000_000, 30 * DAY).bitsPerSecond).toBe(
      2_000_000,
    );
  });
});

describe("outpacesUpload", () => {
  const slow = { bitsPerSecond: 2_000_000, measuredAt: 0 };

  it("flags a preset faster than the connection", () => {
    expect(outpacesUpload("high", false, slow, DAY)).toBe(true);
    expect(outpacesUpload("low", true, slow, DAY)).toBe(true);
  });

  it("leaves presets the connection carries alone", () => {
    expect(outpacesUpload("saver", true, slow, DAY)).toBe(false);
    expect(outpacesUpload("low", false, slow, DAY)).toBe(false);
  });

  it("says nothing without a recent reading", () => {
    expect(outpacesUpload("max", true, null, DAY)).toBe(false);
    expect(outpacesUpload("max", true, slow, 30 * DAY)).toBe(false);
  });
});
