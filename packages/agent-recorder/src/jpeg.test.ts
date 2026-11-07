import { describe, expect, it } from "vitest";
import { jpegSize } from "./jpeg";

const jpeg = (width: number, height: number, progressive = false) =>
  Uint8Array.from([
    0xff,
    0xd8,
    0xff,
    0xe0,
    0x00,
    0x04,
    0x4a,
    0x46,
    0xff,
    progressive ? 0xc2 : 0xc0,
    0x00,
    0x0b,
    0x08,
    height >> 8,
    height & 0xff,
    width >> 8,
    width & 0xff,
    0x01,
    0x01,
    0x11,
    0x00,
    0xff,
    0xd9,
  ]);

describe("jpegSize", () => {
  it("reads the size from baseline and progressive frames", () => {
    expect(jpegSize(jpeg(1920, 1080))).toEqual({ width: 1920, height: 1080 });
    expect(jpegSize(jpeg(1920, 993, true))).toEqual({
      width: 1920,
      height: 993,
    });
  });

  it("gives nothing for what isn't a JPEG", () => {
    expect(jpegSize(Uint8Array.from([0x89, 0x50, 0x4e, 0x47]))).toBeNull();
    expect(jpegSize(Uint8Array.from([0xff, 0xd8, 0xff, 0xd9]))).toBeNull();
  });
});
