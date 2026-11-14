import { describe, expect, it } from "vitest";
import {
  composeShareImage,
  decodeJpeg,
  hexToRgb,
  resizeInto,
  roundedRectDistance,
  shareImageSize,
  shareImageVersion,
  type Rgba,
} from "./share-image";

function solid(
  width: number,
  height: number,
  rgb: [number, number, number],
): Rgba {
  const data = new Uint8Array(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data.set([...rgb, 255], i);
  }
  return { width, height, data };
}

const at = (img: Rgba, x: number, y: number) =>
  Array.from(
    img.data.slice((y * img.width + x) * 4, (y * img.width + x) * 4 + 3),
  );

describe("share image", () => {
  it("sizes the picture to the video's aspect", () => {
    expect(shareImageSize(1920, 1080)).toEqual({ width: 1280, height: 720 });
    expect(shareImageSize(null, null)).toEqual({ width: 1280, height: 720 });
  });

  it("measures distance to a rounded rect", () => {
    const rect = { x: 0, y: 0, width: 100, height: 50 };
    expect(roundedRectDistance(50, 25, rect, 10)).toBeLessThan(0);
    expect(roundedRectDistance(150, 25, rect, 10)).toBeCloseTo(50);
    expect(roundedRectDistance(0, 0, rect, 10)).toBeGreaterThan(0);
  });

  it("averages when shrinking and letterboxes in black", () => {
    const img = resizeInto(
      solid(400, 100, [200, 100, 50]),
      100,
      100,
      "contain",
    );
    expect(at(img, 50, 50)).toEqual([200, 100, 50]);
    expect(at(img, 50, 0)).toEqual([0, 0, 0]);
  });

  it("frames the poster on its background with rounded corners", () => {
    const jpeg = composeShareImage({
      poster: solid(160, 90, [255, 255, 255]),
      frame: { background: "#ff0000", padding: 10, radius: 100, shadow: 0 },
      backgroundImage: null,
      width: 160,
      height: 90,
    });
    const out = decodeJpeg(jpeg)!;
    const near = (a: number[], b: number[]) =>
      a.every((v, i) => Math.abs(v - b[i]!) < 24);
    expect(near(at(out, 2, 2), [255, 0, 0])).toBe(true);
    expect(near(at(out, 80, 45), [255, 255, 255])).toBe(true);
    expect(near(at(out, 17, 10), [255, 0, 0])).toBe(true);
  });

  it("refuses an image over the megapixel limit instead of decoding it", () => {
    const jpeg = composeShareImage({
      poster: solid(8, 8, [255, 255, 255]),
      frame: { background: "#ff0000", padding: 0, radius: 0, shadow: 0 },
      backgroundImage: null,
      width: 160,
      height: 90,
    });
    expect(decodeJpeg(jpeg, 0.01)).toBeNull();
    expect(decodeJpeg(jpeg, 0.02)?.width).toBe(160);
  });

  it("changes version when the frame changes", async () => {
    const base = {
      posterKey: "posters/a.jpg",
      posterThumbKey: null,
      sizeBytes: 1,
      width: 1280,
      height: 720,
      frame: { background: "violet", padding: 4, radius: 8, shadow: 50 },
    };
    const a = await shareImageVersion(base);
    expect(a).toMatch(/^[0-9a-f]{16}$/);
    expect(await shareImageVersion(base)).toBe(a);
    expect(
      await shareImageVersion({ ...base, frame: { ...base.frame, radius: 9 } }),
    ).not.toBe(a);
  });

  it("parses short and long hex", () => {
    expect(hexToRgb("#fff")).toEqual([255, 255, 255]);
    expect(hexToRgb("#102030")).toEqual([16, 32, 48]);
  });
});
