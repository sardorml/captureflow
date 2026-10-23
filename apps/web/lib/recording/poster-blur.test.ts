import { decode, encode } from "jpeg-js";
import { describe, expect, it } from "vitest";
import { BLUR_WIDTH, posterBlurDataUrl } from "./poster-blur";

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

describe("posterBlurDataUrl", () => {
  it("shrinks a JPEG to the blur width, keeping its aspect", () => {
    const url = posterBlurDataUrl(gradientJpeg(96, 54), "image/jpeg");
    expect(url).toMatch(/^data:image\/jpeg;base64,/);
    const small = decodeDataUrl(url!);
    expect(small.width).toBe(BLUR_WIDTH);
    expect(small.height).toBe(14);
    const left = small.data[0];
    const right = small.data[(BLUR_WIDTH - 1) * 4];
    expect(left).toBeLessThan(64);
    expect(right).toBeGreaterThan(192);
  });

  it("stays small", () => {
    const url = posterBlurDataUrl(gradientJpeg(1920, 1080), "image/jpeg");
    expect(url!.length).toBeLessThan(2000);
  });

  it("keeps a source already narrower than the blur width", () => {
    const small = decodeDataUrl(
      posterBlurDataUrl(gradientJpeg(10, 6), "image/jpeg")!,
    );
    expect(small.width).toBe(10);
    expect(small.height).toBe(6);
  });

  it("returns null for other image types and broken bytes", () => {
    expect(posterBlurDataUrl(gradientJpeg(8, 8), "image/png")).toBeNull();
    expect(
      posterBlurDataUrl(new Uint8Array([1, 2, 3, 4]), "image/jpeg"),
    ).toBeNull();
  });
});
