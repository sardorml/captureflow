import { decode, encode, type RawImageData } from "jpeg-js";

export const BLUR_WIDTH = 24;
const BLUR_QUALITY = 60;
// Four columns at the dashboard's widest grid is ~260 px per card, so 640
// covers a 2× display; a 1080p screen capture lands around 30 KB.
// About twice a four-column card's width, so a retina screen gets a sharp
// card at roughly 85 KB; 1024 px at quality 80 measured half as much again.
export const THUMB_WIDTH = 896;
const THUMB_QUALITY = 72;
// The key carries the poster's digest, so the object never changes under it.
export const THUMB_CACHE_CONTROL = "public, max-age=31536000, immutable";
const MAX_MEGAPIXELS = 64;
const DIGEST_HEX_CHARS = 16;

type Rgba = RawImageData<Uint8Array>;

export type PosterThumbnail = {
  blur: string;
  thumb: Uint8Array;
  width: number;
  height: number;
};

/*
 * What the poster tells us about the recording: its frame size, a thumbnail
 * a few hundred bytes long as a data URL so the dashboard can paint something
 * recognisable under the real image before it has loaded, and a card-sized
 * JPEG the dashboard loads instead of the full poster. Null for anything that
 * is not a decodable JPEG.
 */
export function posterThumbnail(
  bytes: ArrayBuffer | Uint8Array,
  contentType: string,
): PosterThumbnail | null {
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
  const blur = encode(downsample(image, BLUR_WIDTH), BLUR_QUALITY);
  const thumb = encode(downsample(image, THUMB_WIDTH), THUMB_QUALITY);
  return {
    blur: `data:image/jpeg;base64,${Buffer.from(blur.data).toString("base64")}`,
    thumb: new Uint8Array(thumb.data),
    width: image.width,
    height: image.height,
  };
}

// Content address for the thumbnail's key: equal posters share it, a
// replaced poster moves to a new URL.
export async function posterDigest(
  bytes: ArrayBuffer | Uint8Array,
): Promise<string> {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    bytes instanceof Uint8Array ? new Uint8Array(bytes) : bytes,
  );
  return Array.from(new Uint8Array(hash), (b) =>
    b.toString(16).padStart(2, "0"),
  )
    .join("")
    .slice(0, DIGEST_HEX_CHARS);
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
