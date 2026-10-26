import { decode, encode } from "jpeg-js";
import { describe, expect, it } from "vitest";
import {
  BLUR_WIDTH,
  THUMB_WIDTH,
  posterDigest,
  posterThumbnail,
} from "./poster-blur";

// Black on the left fading to white on the right.
function gradientJpeg(width: number, height: number): Uint8Array {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const v = Math.round((x / (width - 1)) * 255);
      const i = (y * width + x) * 4;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  return new Uint8Array(encode({ width, height, data }, 95).data);
}

function decodeDataUrl(url: string) {
  const base64 = url.slice("data:image/jpeg;base64,".length);
  return decode(Buffer.from(base64, "base64"), { useTArray: true });
}

describe("posterThumbnail", () => {
  it("reports the frame size and shrinks the JPEG to the blur width", () => {
    const thumb = posterThumbnail(gradientJpeg(96, 54), "image/jpeg");
    expect(thumb).toMatchObject({ width: 96, height: 54 });
    expect(thumb!.blur).toMatch(/^data:image\/jpeg;base64,/);
    const small = decodeDataUrl(thumb!.blur);
    expect(small.width).toBe(BLUR_WIDTH);
    expect(small.height).toBe(14);
    const left = small.data[0];
    const right = small.data[(BLUR_WIDTH - 1) * 4];
    expect(left).toBeLessThan(64);
    expect(right).toBeGreaterThan(192);
  });

  it("keeps the blur small", () => {
    const thumb = posterThumbnail(gradientJpeg(1920, 1080), "image/jpeg");
    expect(thumb!.blur.length).toBeLessThan(2000);
  });

  it("shrinks the card thumbnail to the thumb width and keeps it light", () => {
    const thumb = posterThumbnail(gradientJpeg(1920, 1080), "image/jpeg");
    const card = decode(thumb!.thumb, { useTArray: true });
    expect(card.width).toBe(THUMB_WIDTH);
    expect(card.height).toBe(504);
    expect(thumb!.thumb.byteLength).toBeLessThan(150_000);
  });

  it("keeps a source already narrower than the thumb width at its size", () => {
    const card = decode(
      posterThumbnail(gradientJpeg(320, 180), "image/jpeg")!.thumb,
      { useTArray: true },
    );
    expect(card.width).toBe(320);
    expect(card.height).toBe(180);
  });

  it("keeps a source already narrower than the blur width", () => {
    const small = decodeDataUrl(
      posterThumbnail(gradientJpeg(10, 6), "image/jpeg")!.blur,
    );
    expect(small.width).toBe(10);
    expect(small.height).toBe(6);
  });

  it("returns null for other image types and broken bytes", () => {
    expect(posterThumbnail(gradientJpeg(8, 8), "image/png")).toBeNull();
    expect(
      posterThumbnail(new Uint8Array([1, 2, 3, 4]), "image/jpeg"),
    ).toBeNull();
  });
});

describe("posterDigest", () => {
  it("is 16 hex characters, stable for equal bytes, different otherwise", async () => {
    const a = await posterDigest(new Uint8Array([1, 2, 3]));
    expect(a).toMatch(/^[0-9a-f]{16}$/);
    expect(await posterDigest(new Uint8Array([1, 2, 3]).buffer)).toBe(a);
    expect(await posterDigest(new Uint8Array([1, 2, 4]))).not.toBe(a);
  });
});
