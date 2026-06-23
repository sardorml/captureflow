import UPNG from "upng-js";

import { logInfo, logWarn } from "./logger";

// Must stay in sync with the web snap editor's GRADIENT_PRESETS.violet
// (stops) and BG_PADDING_RATIO (0.12 of min(w,h)).

type Stop = { t: number; r: number; g: number; b: number };

const VIOLET_STOPS: Stop[] = [
  { t: 0, r: 0x63, g: 0x66, b: 0xf1 },
  { t: 0.5, r: 0xa8, g: 0x55, b: 0xf7 },
  { t: 1, r: 0xe9, g: 0xd5, b: 0xff },
];

const BG_PADDING_RATIO = 0.12;
// 1% of source width — keep in sync with the editor's KonvaImage
// `cornerRadius={imgRenderW * 0.01}` in SnapEditorImpl.tsx.
const CORNER_RADIUS_RATIO = 0.01;

// Coverage alpha (0..1) for pixel (x, y) of a w×h rounded-rect with corner
// radius r: 1 inside, 0 in the clipped corner, 1-pixel AA band along the arc.
function roundedRectAlpha(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): number {
  if (r <= 0) return 1;
  const px = x + 0.5;
  const py = y + 0.5;
  let cx: number;
  let cy: number;
  if (px < r && py < r) {
    cx = r;
    cy = r;
  } else if (px > w - r && py < r) {
    cx = w - r;
    cy = r;
  } else if (px < r && py > h - r) {
    cx = r;
    cy = h - r;
  } else if (px > w - r && py > h - r) {
    cx = w - r;
    cy = h - r;
  } else {
    return 1;
  }
  const dx = px - cx;
  const dy = py - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist <= r - 0.5) return 1;
  if (dist >= r + 0.5) return 0;
  return r + 0.5 - dist;
}

// 256-entry lookup so the inner pixel loop avoids a per-pixel walk of the stops.
const GRADIENT_LUT: Uint8Array = (() => {
  const lut = new Uint8Array(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let r = VIOLET_STOPS[VIOLET_STOPS.length - 1].r;
    let g = VIOLET_STOPS[VIOLET_STOPS.length - 1].g;
    let b = VIOLET_STOPS[VIOLET_STOPS.length - 1].b;
    for (let s = 1; s < VIOLET_STOPS.length; s++) {
      const prev = VIOLET_STOPS[s - 1];
      const curr = VIOLET_STOPS[s];
      if (t <= curr.t) {
        const local = (t - prev.t) / (curr.t - prev.t);
        r = Math.round(prev.r + (curr.r - prev.r) * local);
        g = Math.round(prev.g + (curr.g - prev.g) * local);
        b = Math.round(prev.b + (curr.b - prev.b) * local);
        break;
      }
    }
    lut[i * 3] = r;
    lut[i * 3 + 1] = g;
    lut[i * 3 + 2] = b;
  }
  return lut;
})();

function bufferToArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength,
  ) as ArrayBuffer;
}

function uint8ToArrayBuffer(u: Uint8Array): ArrayBuffer {
  return u.buffer.slice(
    u.byteOffset,
    u.byteOffset + u.byteLength,
  ) as ArrayBuffer;
}

function decodeToRGBA(
  input: Buffer,
): { rgba: Uint8Array; width: number; height: number } | null {
  try {
    const decoded = UPNG.decode(bufferToArrayBuffer(input));
    const frames = UPNG.toRGBA8(decoded);
    if (!frames || frames.length === 0) return null;
    return {
      rgba: new Uint8Array(frames[0]),
      width: decoded.width,
      height: decoded.height,
    };
  } catch (err) {
    logWarn("snap-bake", `decode failed: ${String(err)}`);
    return null;
  }
}

function encodePalette(
  rgba: Uint8Array,
  width: number,
  height: number,
): Buffer {
  const out = UPNG.encode([uint8ToArrayBuffer(rgba)], width, height, 256);
  return Buffer.from(out);
}

export type SnapBakeResult = {
  composedBytes: Buffer;
  sourceBytes: Buffer;
  composedWidth: number;
  composedHeight: number;
  sourceWidth: number;
  sourceHeight: number;
  background: "violet";
};

export function bakeSnapWithDefaultBackground(input: Buffer): SnapBakeResult {
  const t0 = Date.now();

  const decoded = decodeToRGBA(input);
  if (!decoded) {
    // Caller treats composedBytes === sourceBytes as the "no bake happened" signal.
    return {
      composedBytes: input,
      sourceBytes: input,
      composedWidth: 0,
      composedHeight: 0,
      sourceWidth: 0,
      sourceHeight: 0,
      background: "violet",
    };
  }

  const { rgba: srcRGBA, width: srcW, height: srcH } = decoded;
  const pad = Math.round(Math.min(srcW, srcH) * BG_PADDING_RATIO);
  const cw = srcW + pad * 2;
  const ch = srcH + pad * 2;

  // Linear gradient (0,0)→(cw,ch), matching Konva's fillLinearGradient points on
  // BackgroundLayer. t = (x,y) projected onto (cw,ch), normalised by length squared.
  const denom = cw * cw + ch * ch;
  const coefX = cw / denom;
  const coefY = ch / denom;

  const composed = new Uint8Array(cw * ch * 4);

  for (let y = 0; y < ch; y++) {
    const yPart = y * coefY;
    const rowBase = y * cw * 4;
    for (let x = 0; x < cw; x++) {
      let t = x * coefX + yPart;
      if (t < 0) t = 0;
      else if (t > 1) t = 1;
      const li = ((t * 255) | 0) * 3;
      const i = rowBase + x * 4;
      composed[i] = GRADIENT_LUT[li];
      composed[i + 1] = GRADIENT_LUT[li + 1];
      composed[i + 2] = GRADIENT_LUT[li + 2];
      composed[i + 3] = 255;
    }
  }

  // Alpha-blend the source on top with a rounded-rect mask to match the editor's
  // cornerRadius look. Only corner insets pay roundedRectAlpha; the rest is fast-path.
  const cornerR = Math.round(srcW * CORNER_RADIUS_RATIO);
  for (let y = 0; y < srcH; y++) {
    const srcRow = y * srcW * 4;
    const dstRow = ((y + pad) * cw + pad) * 4;
    const yInCornerBand = cornerR > 0 && (y < cornerR || y >= srcH - cornerR);
    for (let x = 0; x < srcW; x++) {
      let mask = 1;
      if (yInCornerBand && (x < cornerR || x >= srcW - cornerR)) {
        mask = roundedRectAlpha(x, y, srcW, srcH, cornerR);
        if (mask === 0) continue;
      }
      const si = srcRow + x * 4;
      const di = dstRow + x * 4;
      const sa = srcRGBA[si + 3];
      const a = mask >= 1 ? sa / 255 : (sa / 255) * mask;
      if (a >= 0.999) {
        composed[di] = srcRGBA[si];
        composed[di + 1] = srcRGBA[si + 1];
        composed[di + 2] = srcRGBA[si + 2];
      } else if (a > 0) {
        const ia = 1 - a;
        composed[di] = (srcRGBA[si] * a + composed[di] * ia) | 0;
        composed[di + 1] = (srcRGBA[si + 1] * a + composed[di + 1] * ia) | 0;
        composed[di + 2] = (srcRGBA[si + 2] * a + composed[di + 2] * ia) | 0;
      }
    }
  }

  let composedBytes: Buffer;
  try {
    composedBytes = encodePalette(composed, cw, ch);
  } catch (err) {
    logWarn("snap-bake", `composed encode failed: ${String(err)}`);
    composedBytes = input;
  }

  // Re-encode the source as palette PNG for the editor's pristine sidecar; bail to
  // raw bytes if the palette version grew.
  let sourceBytes: Buffer;
  try {
    sourceBytes = encodePalette(srcRGBA, srcW, srcH);
    if (sourceBytes.byteLength >= input.byteLength) {
      sourceBytes = input;
    }
  } catch (err) {
    logWarn("snap-bake", `source re-encode failed: ${String(err)}`);
    sourceBytes = input;
  }

  const ms = Date.now() - t0;
  logInfo(
    "snap-bake",
    `baked ${srcW}×${srcH} → ${cw}×${ch}: composed=${composedBytes.byteLength}B source=${sourceBytes.byteLength}B (${ms}ms)`,
  );

  return {
    composedBytes,
    sourceBytes,
    composedWidth: cw,
    composedHeight: ch,
    sourceWidth: srcW,
    sourceHeight: srcH,
    background: "violet",
  };
}
