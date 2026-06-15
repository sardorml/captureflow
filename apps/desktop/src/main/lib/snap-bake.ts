import UPNG from 'upng-js'

import { logInfo, logWarn } from './logger'

// Bake the default 'violet' gradient background (mirrors the web
// editor's hydrateBackground(null)) into the captured PNG before
// upload. The composed bytes are what `captureflow.xyz/<id>`
// serves; the pristine source bytes (also re-encoded as PNG-8) are
// what the editor loads from `.source.png` so subsequent edits don't
// double-bake the gradient.
//
// Stays in sync with the web snap editor's GRADIENT_PRESETS.violet
// (stops) and BG_PADDING_RATIO (0.12 of min(w,h)).
//
// Pure-JS — no native deps so the electron-builder asar bundle stays
// portable. Pixel ops on a 4300×3000 retina capture run ~150ms; the
// palette encode runs ~1-2s. The snap-notification modal's spinner
// already paints during this window so the cost is hidden from the
// user's foreground action.

type Stop = { t: number; r: number; g: number; b: number }

const VIOLET_STOPS: Stop[] = [
  { t: 0, r: 0x63, g: 0x66, b: 0xf1 },
  { t: 0.5, r: 0xa8, g: 0x55, b: 0xf7 },
  { t: 1, r: 0xe9, g: 0xd5, b: 0xff }
]

const BG_PADDING_RATIO = 0.12
// Matches the web editor's KonvaImage `cornerRadius={imgRenderW * 0.01}`
// when a background is applied. 1% of the source width — keep in sync
// with SnapEditorImpl.tsx's KonvaImage props.
const CORNER_RADIUS_RATIO = 0.01

// Returns the foreground-coverage alpha (0..1) for pixel (x, y) of a
// w×h rounded-rect with corner radius r. 1 inside the rect, 0 in the
// clipped corner, and a 1-pixel band of intermediate values along the
// arc for antialiasing. Fast-paths return 1 when the pixel isn't even
// in a corner inset; callers skip the call entirely for the central
// strip so the per-pixel cost only lands on the corner regions.
function roundedRectAlpha(x: number, y: number, w: number, h: number, r: number): number {
  if (r <= 0) return 1
  // Pixel center for cleaner AA than corner-anchored sampling.
  const px = x + 0.5
  const py = y + 0.5
  let cx: number
  let cy: number
  if (px < r && py < r) {
    cx = r
    cy = r
  } else if (px > w - r && py < r) {
    cx = w - r
    cy = r
  } else if (px < r && py > h - r) {
    cx = r
    cy = h - r
  } else if (px > w - r && py > h - r) {
    cx = w - r
    cy = h - r
  } else {
    return 1
  }
  const dx = px - cx
  const dy = py - cy
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist <= r - 0.5) return 1
  if (dist >= r + 0.5) return 0
  return r + 0.5 - dist
}

// 256-entry lookup so the inner pixel loop avoids a per-pixel branch
// through the stop list. Computed once at module load.
const GRADIENT_LUT: Uint8Array = (() => {
  const lut = new Uint8Array(256 * 3)
  for (let i = 0; i < 256; i++) {
    const t = i / 255
    let r = VIOLET_STOPS[VIOLET_STOPS.length - 1].r
    let g = VIOLET_STOPS[VIOLET_STOPS.length - 1].g
    let b = VIOLET_STOPS[VIOLET_STOPS.length - 1].b
    for (let s = 1; s < VIOLET_STOPS.length; s++) {
      const prev = VIOLET_STOPS[s - 1]
      const curr = VIOLET_STOPS[s]
      if (t <= curr.t) {
        const local = (t - prev.t) / (curr.t - prev.t)
        r = Math.round(prev.r + (curr.r - prev.r) * local)
        g = Math.round(prev.g + (curr.g - prev.g) * local)
        b = Math.round(prev.b + (curr.b - prev.b) * local)
        break
      }
    }
    lut[i * 3] = r
    lut[i * 3 + 1] = g
    lut[i * 3 + 2] = b
  }
  return lut
})()

function bufferToArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
}

function uint8ToArrayBuffer(u: Uint8Array): ArrayBuffer {
  return u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength) as ArrayBuffer
}

function decodeToRGBA(input: Buffer): { rgba: Uint8Array; width: number; height: number } | null {
  try {
    const decoded = UPNG.decode(bufferToArrayBuffer(input))
    const frames = UPNG.toRGBA8(decoded)
    if (!frames || frames.length === 0) return null
    return {
      rgba: new Uint8Array(frames[0]),
      width: decoded.width,
      height: decoded.height
    }
  } catch (err) {
    logWarn('snap-bake', `decode failed: ${String(err)}`)
    return null
  }
}

function encodePalette(rgba: Uint8Array, width: number, height: number): Buffer {
  const out = UPNG.encode([uint8ToArrayBuffer(rgba)], width, height, 256)
  return Buffer.from(out)
}

export type SnapBakeResult = {
  composedBytes: Buffer
  sourceBytes: Buffer
  composedWidth: number
  composedHeight: number
  sourceWidth: number
  sourceHeight: number
  background: 'violet'
}

export function bakeSnapWithDefaultBackground(input: Buffer): SnapBakeResult {
  const t0 = Date.now()

  const decoded = decodeToRGBA(input)
  if (!decoded) {
    // Decode failure: hand back the raw bytes for both slots so the
    // upload still proceeds. Caller treats composedBytes === sourceBytes
    // as the "no bake happened" signal.
    return {
      composedBytes: input,
      sourceBytes: input,
      composedWidth: 0,
      composedHeight: 0,
      sourceWidth: 0,
      sourceHeight: 0,
      background: 'violet'
    }
  }

  const { rgba: srcRGBA, width: srcW, height: srcH } = decoded
  const pad = Math.round(Math.min(srcW, srcH) * BG_PADDING_RATIO)
  const cw = srcW + pad * 2
  const ch = srcH + pad * 2

  // Linear gradient from (0,0) to (cw,ch) — matches Konva's
  // fillLinearGradient{Start,End}Point on BackgroundLayer.
  // t = projection of (x,y) onto direction (cw,ch), normalised by
  // direction length squared.
  const denom = cw * cw + ch * ch
  const coefX = cw / denom
  const coefY = ch / denom

  const composed = new Uint8Array(cw * ch * 4)

  for (let y = 0; y < ch; y++) {
    const yPart = y * coefY
    const rowBase = y * cw * 4
    for (let x = 0; x < cw; x++) {
      let t = x * coefX + yPart
      if (t < 0) t = 0
      else if (t > 1) t = 1
      const li = ((t * 255) | 0) * 3
      const i = rowBase + x * 4
      composed[i] = GRADIENT_LUT[li]
      composed[i + 1] = GRADIENT_LUT[li + 1]
      composed[i + 2] = GRADIENT_LUT[li + 2]
      composed[i + 3] = 255
    }
  }

  // Alpha-blend the source on top, with a rounded-rect mask so the
  // baked PNG matches the editor's `cornerRadius` look. Most pixels
  // sit far from any corner and stay on the fast path; only the
  // corner insets pay the `roundedRectAlpha` call.
  const cornerR = Math.round(srcW * CORNER_RADIUS_RATIO)
  for (let y = 0; y < srcH; y++) {
    const srcRow = y * srcW * 4
    const dstRow = ((y + pad) * cw + pad) * 4
    const yInCornerBand = cornerR > 0 && (y < cornerR || y >= srcH - cornerR)
    for (let x = 0; x < srcW; x++) {
      let mask = 1
      if (yInCornerBand && (x < cornerR || x >= srcW - cornerR)) {
        mask = roundedRectAlpha(x, y, srcW, srcH, cornerR)
        if (mask === 0) continue
      }
      const si = srcRow + x * 4
      const di = dstRow + x * 4
      const sa = srcRGBA[si + 3]
      // Combined alpha = source alpha × corner mask, both in [0,1].
      const a = mask >= 1 ? sa / 255 : (sa / 255) * mask
      if (a >= 0.999) {
        composed[di] = srcRGBA[si]
        composed[di + 1] = srcRGBA[si + 1]
        composed[di + 2] = srcRGBA[si + 2]
      } else if (a > 0) {
        const ia = 1 - a
        composed[di] = (srcRGBA[si] * a + composed[di] * ia) | 0
        composed[di + 1] = (srcRGBA[si + 1] * a + composed[di + 1] * ia) | 0
        composed[di + 2] = (srcRGBA[si + 2] * a + composed[di + 2] * ia) | 0
      }
      // a === 0 → keep gradient pixel; alpha already 255.
    }
  }

  let composedBytes: Buffer
  try {
    composedBytes = encodePalette(composed, cw, ch)
  } catch (err) {
    logWarn('snap-bake', `composed encode failed: ${String(err)}`)
    composedBytes = input
  }

  // Re-encode the source as palette PNG so the editor's pristine
  // sidecar matches the same wire-size profile as the composed PNG.
  // Bail back to the raw bytes if the palette version grew (rare on
  // already-quantised PNGs).
  let sourceBytes: Buffer
  try {
    sourceBytes = encodePalette(srcRGBA, srcW, srcH)
    if (sourceBytes.byteLength >= input.byteLength) {
      sourceBytes = input
    }
  } catch (err) {
    logWarn('snap-bake', `source re-encode failed: ${String(err)}`)
    sourceBytes = input
  }

  const ms = Date.now() - t0
  logInfo(
    'snap-bake',
    `baked ${srcW}×${srcH} → ${cw}×${ch}: composed=${composedBytes.byteLength}B source=${sourceBytes.byteLength}B (${ms}ms)`
  )

  return {
    composedBytes,
    sourceBytes,
    composedWidth: cw,
    composedHeight: ch,
    sourceWidth: srcW,
    sourceHeight: srcH,
    background: 'violet'
  }
}
