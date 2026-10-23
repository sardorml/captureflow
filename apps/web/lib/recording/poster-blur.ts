import { decode, encode, type RawImageData } from "jpeg-js";

export const BLUR_WIDTH = 24;
const BLUR_QUALITY = 60;
const MAX_MEGAPIXELS = 64;

type Rgba = RawImageData<Uint8Array>;

/*
 * A thumbnail of the poster a few hundred bytes long, as a data URL, so the
 * dashboard can paint something recognisable under the real image before
 * it has loaded. Null for anything that is not a decodable JPEG.
 */
export function posterBlurDataUrl(
  bytes: ArrayBuffer | Uint8Array,
  contentType: string,
): string | null {
  if (contentType !== "image/jpeg") return null;
  let image: Rgba;
  try {
    image = decode(bytes, {
      useTArray: true,
      formatAsRGBA: true,
      maxResolutionInMP: MAX_MEGAPIXELS,
    });
  } catch {
    return null;
  }
  const jpeg = encode(downsample(image, BLUR_WIDTH), BLUR_QUALITY);
  return `data:image/jpeg;base64,${Buffer.from(jpeg.data).toString("base64")}`;
}

// Box filter: each output pixel is the mean of the source block it covers.
function downsample(src: Rgba, width: number): Rgba {
  if (src.width <= width) return src;
  const height = Math.max(1, Math.round((src.height * width) / src.width));
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    const y0 = Math.floor((y * src.height) / height);
    const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * src.height) / height));
    for (let x = 0; x < width; x++) {
      const x0 = Math.floor((x * src.width) / width);
      const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * src.width) / width));
      let r = 0;
      let g = 0;
      let b = 0;
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const i = (sy * src.width + sx) * 4;
          r += src.data[i];
          g += src.data[i + 1];
          b += src.data[i + 2];
        }
      }
      const count = (y1 - y0) * (x1 - x0);
      const o = (y * width + x) * 4;
      data[o] = Math.round(r / count);
      data[o + 1] = Math.round(g / count);
      data[o + 2] = Math.round(b / count);
      data[o + 3] = 255;
    }
  }
  return { width, height, data };
}
