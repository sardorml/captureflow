import { decode, encode } from "jpeg-js";
import {
  isRecordingGradientKey,
  isRecordingHexColor,
  RECORDING_GRADIENT_PRESETS,
  type RecordingConfig,
} from "@/lib/recording-config";
import { coverRect, frameLayout, gradientLine, type Rect } from "./export-plan";

export type Rgba = { width: number; height: number; data: Uint8Array };

export const SHARE_IMAGE_WIDTH = 1280;
const SHARE_IMAGE_QUALITY = 85;
const MAX_MEGAPIXELS = 64;
const VERSION = 1;

export type ShareFrame = Pick<
  RecordingConfig,
  "background" | "padding" | "radius" | "shadow"
>;

export function shareImageSize(
  videoWidth: number | null,
  videoHeight: number | null,
): { width: number; height: number } {
  const aspect =
    videoWidth && videoHeight && videoWidth > 0 && videoHeight > 0
      ? videoWidth / videoHeight
      : 16 / 9;
  return {
    width: SHARE_IMAGE_WIDTH,
    height: Math.round(SHARE_IMAGE_WIDTH / aspect),
  };
}

// Changes whenever anything drawn into the picture does, so the URL and the
// R2 key can be cached forever.
export async function shareImageVersion(input: {
  posterKey: string;
  posterThumbKey: string | null;
  sizeBytes: number;
  width: number;
  height: number;
  frame: ShareFrame;
}): Promise<string> {
  const { frame } = input;
  const text = JSON.stringify([
    VERSION,
    input.posterKey,
    input.posterThumbKey,
    input.sizeBytes,
    input.width,
    input.height,
    frame.background,
    frame.padding,
    frame.radius,
    frame.shadow,
  ]);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(digest).slice(0, 8), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

// Decoding costs about 26 MB a megapixel, so a background is refused past this instead of running the Worker out of memory.
export const BACKGROUND_MAX_MEGAPIXELS = 2.5;

export function decodeJpeg(
  bytes: Uint8Array,
  maxMegapixels = MAX_MEGAPIXELS,
): Rgba | null {
  try {
    return decode(bytes, {
      useTArray: true,
      formatAsRGBA: true,
      maxResolutionInMP: maxMegapixels,
    });
  } catch {
    return null;
  }
}

/*
 * The poster on its background, framed the way the player frames the video:
 * padding, rounded corners and the drop shadow, at a link-preview size.
 * `backgroundImage` is the decoded wallpaper or upload when the background
 * is one; colours and gradients are drawn here.
 */
export function composeShareImage(input: {
  poster: Rgba;
  frame: ShareFrame;
  backgroundImage: Rgba | null;
  width: number;
  height: number;
}): Uint8Array<ArrayBuffer> {
  const { width, height, frame } = input;
  const out = paintBackground(
    frame.background,
    input.backgroundImage,
    width,
    height,
  );
  const { rect, radius, shadow } = frameLayout(width, height, frame);

  if (shadow.alpha > 0) {
    const shrink = -shadow.spread;
    const shadowRect = {
      x: rect.x + shrink,
      y: rect.y + shrink + shadow.offsetY,
      width: rect.width - 2 * shrink,
      height: rect.height - 2 * shrink,
    };
    const sigma = Math.max(0.5, shadow.blur / 2);
    const r = Math.max(0, radius - shrink);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const d = roundedRectDistance(x + 0.5, y + 0.5, shadowRect, r);
        const a = shadow.alpha * 0.5 * erfc(d / (sigma * Math.SQRT2));
        if (a < 1 / 512) continue;
        const o = (y * width + x) * 4;
        out.data[o] = out.data[o]! * (1 - a);
        out.data[o + 1] = out.data[o + 1]! * (1 - a);
        out.data[o + 2] = out.data[o + 2]! * (1 - a);
      }
    }
  }

  const screen = resizeInto(
    input.poster,
    Math.max(1, Math.round(rect.width)),
    Math.max(1, Math.round(rect.height)),
    "contain",
  );
  const left = Math.floor(rect.x);
  const top = Math.floor(rect.y);
  for (let y = top; y < Math.min(height, top + screen.height + 1); y++) {
    for (let x = left; x < Math.min(width, left + screen.width + 1); x++) {
      const coverage = clamp01(
        0.5 - roundedRectDistance(x + 0.5, y + 0.5, rect, radius),
      );
      if (coverage <= 0) continue;
      const sx = Math.min(screen.width - 1, Math.max(0, x - left));
      const sy = Math.min(screen.height - 1, Math.max(0, y - top));
      const s = (sy * screen.width + sx) * 4;
      const o = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) {
        out.data[o + c] =
          out.data[o + c]! +
          (screen.data[s + c]! - out.data[o + c]!) * coverage;
      }
    }
  }

  return Uint8Array.from(encode(out, SHARE_IMAGE_QUALITY).data);
}

function paintBackground(
  background: string,
  image: Rgba | null,
  width: number,
  height: number,
): Rgba {
  if (image) return resizeInto(image, width, height, "cover");
  const data = new Uint8Array(width * height * 4);
  if (isRecordingGradientKey(background)) {
    const stops = RECORDING_GRADIENT_PRESETS[background].stops.map((s) => ({
      offset: s.offset,
      rgb: hexToRgb(s.color),
    }));
    const line = gradientLine(width, height, 135);
    const dx = line.x1 - line.x0;
    const dy = line.y1 - line.y0;
    const len2 = dx * dx + dy * dy;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const t = clamp01(
          ((x + 0.5 - line.x0) * dx + (y + 0.5 - line.y0) * dy) / len2,
        );
        const rgb = gradientAt(stops, t);
        const o = (y * width + x) * 4;
        data[o] = rgb[0];
        data[o + 1] = rgb[1];
        data[o + 2] = rgb[2];
        data[o + 3] = 255;
      }
    }
    return { width, height, data };
  }
  const rgb = isRecordingHexColor(background)
    ? hexToRgb(background)
    : ([39, 39, 42] as const);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = rgb[0];
    data[i + 1] = rgb[1];
    data[i + 2] = rgb[2];
    data[i + 3] = 255;
  }
  return { width, height, data };
}

function gradientAt(
  stops: { offset: number; rgb: readonly [number, number, number] }[],
  t: number,
): readonly [number, number, number] {
  const first = stops[0]!;
  if (t <= first.offset) return first.rgb;
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1]!;
    const b = stops[i]!;
    if (t <= b.offset) {
      const k = (t - a.offset) / Math.max(1e-6, b.offset - a.offset);
      return [
        a.rgb[0] + (b.rgb[0] - a.rgb[0]) * k,
        a.rgb[1] + (b.rgb[1] - a.rgb[1]) * k,
        a.rgb[2] + (b.rgb[2] - a.rgb[2]) * k,
      ];
    }
  }
  return stops[stops.length - 1]!.rgb;
}

export function hexToRgb(hex: string): readonly [number, number, number] {
  const h = hex.slice(1);
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Signed distance from a point to a rounded rect's edge: negative inside.
export function roundedRectDistance(
  px: number,
  py: number,
  rect: Rect,
  radius: number,
): number {
  const hw = rect.width / 2;
  const hh = rect.height / 2;
  const r = Math.min(radius, hw, hh);
  const qx = Math.abs(px - (rect.x + hw)) - (hw - r);
  const qy = Math.abs(py - (rect.y + hh)) - (hh - r);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  return outside + Math.min(Math.max(qx, qy), 0) - r;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

// Abramowitz-Stegun 7.1.26; plenty for a soft shadow.
function erfc(x: number): number {
  const z = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * z);
  const y =
    t *
    (0.254829592 +
      t *
        (-0.284496736 +
          t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const r = y * Math.exp(-z * z);
  return x >= 0 ? r : 2 - r;
}

/*
 * Scales an image to exactly width x height, cropping (cover) or
 * letterboxing in black (contain). Shrinking averages every source pixel
 * under the target pixel; enlarging interpolates.
 */
export function resizeInto(
  src: Rgba,
  width: number,
  height: number,
  fit: "cover" | "contain",
): Rgba {
  const box: Rect = { x: 0, y: 0, width, height };
  const placed =
    fit === "cover"
      ? coverRect(src.width, src.height, box)
      : containRect(src.width, src.height, box);
  const scale = placed.width / src.width;
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    const sy0 = (y - placed.y) / scale;
    const sy1 = (y + 1 - placed.y) / scale;
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      data[o + 3] = 255;
      const sx0 = (x - placed.x) / scale;
      const sx1 = (x + 1 - placed.x) / scale;
      if (sx1 <= 0 || sy1 <= 0 || sx0 >= src.width || sy0 >= src.height) {
        continue;
      }
      if (scale < 1) {
        const x0 = Math.max(0, Math.floor(sx0));
        const x1 = Math.min(src.width, Math.max(x0 + 1, Math.ceil(sx1)));
        const y0 = Math.max(0, Math.floor(sy0));
        const y1 = Math.min(src.height, Math.max(y0 + 1, Math.ceil(sy1)));
        let r = 0;
        let g = 0;
        let b = 0;
        for (let yy = y0; yy < y1; yy++) {
          let i = (yy * src.width + x0) * 4;
          for (let xx = x0; xx < x1; xx++, i += 4) {
            r += src.data[i]!;
            g += src.data[i + 1]!;
            b += src.data[i + 2]!;
          }
        }
        const n = (x1 - x0) * (y1 - y0);
        data[o] = r / n;
        data[o + 1] = g / n;
        data[o + 2] = b / n;
      } else {
        const fx = Math.min(src.width - 1, Math.max(0, (sx0 + sx1) / 2 - 0.5));
        const fy = Math.min(src.height - 1, Math.max(0, (sy0 + sy1) / 2 - 0.5));
        const ix = Math.floor(fx);
        const iy = Math.floor(fy);
        const ax = fx - ix;
        const ay = fy - iy;
        const jx = Math.min(src.width - 1, ix + 1);
        const jy = Math.min(src.height - 1, iy + 1);
        for (let c = 0; c < 3; c++) {
          const p = (row: number, col: number) =>
            src.data[(row * src.width + col) * 4 + c]!;
          const top = p(iy, ix) + (p(iy, jx) - p(iy, ix)) * ax;
          const bottom = p(jy, ix) + (p(jy, jx) - p(jy, ix)) * ax;
          data[o + c] = top + (bottom - top) * ay;
        }
      }
    }
  }
  return { width, height, data };
}

function containRect(srcWidth: number, srcHeight: number, box: Rect): Rect {
  const scale = Math.min(box.width / srcWidth, box.height / srcHeight);
  const width = srcWidth * scale;
  const height = srcHeight * scale;
  return {
    x: box.x + (box.width - width) / 2,
    y: box.y + (box.height - height) / 2,
    width,
    height,
  };
}
