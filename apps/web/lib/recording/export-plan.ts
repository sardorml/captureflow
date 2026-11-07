import type { RecordingCut } from "@/lib/recording/cuts";
import type {
  RecordingCameraCorner,
  RecordingCameraPoint,
  RecordingCameraSize,
  RecordingConfig,
} from "@/lib/recording-config";

export type KeptSegment = {
  srcStart: number;
  srcEnd: number;
  outStart: number;
};

export type ExportSources = {
  videoUrl: string;
  webcamUrl: string | null;
  backgroundImageUrl: string | null;
};

export type Rect = { x: number; y: number; width: number; height: number };

// Seconds throughout, so the plan lines up with decoder timestamps.
export function keptSegments(
  durationSec: number,
  cuts: readonly RecordingCut[],
): KeptSegment[] {
  const segments: KeptSegment[] = [];
  let cursor = 0;
  let out = 0;
  const push = (end: number) => {
    if (end - cursor > 1e-6) {
      segments.push({ srcStart: cursor, srcEnd: end, outStart: out });
      out += end - cursor;
    }
  };
  for (const cut of cuts) {
    const start = Math.min(durationSec, cut.startMs / 1000);
    const end = Math.min(durationSec, cut.endMs / 1000);
    if (start > cursor) push(start);
    cursor = Math.max(cursor, end);
  }
  push(durationSec);
  return segments;
}

export function editedDuration(segments: readonly KeptSegment[]): number {
  const last = segments[segments.length - 1];
  return last ? last.outStart + (last.srcEnd - last.srcStart) : 0;
}

export function sourceTimeAt(
  outSec: number,
  segments: readonly KeptSegment[],
): number {
  for (const s of segments) {
    if (outSec < s.outStart + (s.srcEnd - s.srcStart)) {
      return s.srcStart + Math.max(0, outSec - s.outStart);
    }
  }
  const last = segments[segments.length - 1];
  return last ? last.srcEnd : 0;
}

// Mirrors recordingFrameStyle: inset is a percent of each axis, the rest of
// the frame is in units of the stage width.
export function frameLayout(
  width: number,
  height: number,
  frame: Pick<RecordingConfig, "padding" | "radius" | "shadow">,
): {
  rect: Rect;
  radius: number;
  shadow: { offsetY: number; blur: number; spread: number; alpha: number };
} {
  const p = frame.padding / 100;
  const s = frame.shadow / 100;
  return {
    rect: {
      x: width * p,
      y: height * p,
      width: width * (1 - 2 * p),
      height: height * (1 - 2 * p),
    },
    radius: (frame.radius / 1000) * width,
    shadow: {
      offsetY: 0.04 * s * width,
      blur: 0.12 * s * width,
      spread: -0.04 * s * width,
      alpha: s,
    },
  };
}

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

// Grows the canvas around the recording so the frame holds it at its own
// pixels instead of shrinking it by the padding.
export function exportCanvas(
  srcWidth: number,
  srcHeight: number,
  padding: number,
  framed: boolean,
): { width: number; height: number; rect: Rect } {
  const width = even(srcWidth);
  const height = even(srcHeight);
  if (!framed) {
    return { width, height, rect: { x: 0, y: 0, width, height } };
  }
  const p = padding / 100;
  const k = p / (1 - 2 * p);
  const mx = Math.round(width * k);
  const my = Math.round(height * k);
  return {
    width: width + 2 * mx,
    height: height + 2 * my,
    rect: { x: mx, y: my, width, height },
  };
}

export function scaleCanvas(
  layout: { width: number; height: number; rect: Rect },
  scale: number,
): { width: number; height: number; rect: Rect } {
  if (scale >= 1) return layout;
  const { rect } = layout;
  return {
    width: even(layout.width * scale),
    height: even(layout.height * scale),
    rect: {
      x: Math.round(rect.x * scale),
      y: Math.round(rect.y * scale),
      width: Math.round(rect.width * scale),
      height: Math.round(rect.height * scale),
    },
  };
}

const BUBBLE_FRACTION: Record<RecordingCameraSize, number> = {
  small: 0.12,
  medium: 0.16,
  large: 0.22,
};

// The player's 24px corner margin on a ~950px share-page player.
const CORNER_INSET = 0.025;

export function bubbleRect(
  width: number,
  height: number,
  camera: {
    corner: RecordingCameraCorner;
    point: RecordingCameraPoint | null;
    size: RecordingCameraSize;
  },
): Rect {
  const d = BUBBLE_FRACTION[camera.size] * width;
  const along = (centre: number, extent: number) =>
    Math.min(extent - d, Math.max(0, centre - d / 2));
  if (camera.point) {
    return {
      x: along(camera.point.x * width, width),
      y: along(camera.point.y * height, height),
      width: d,
      height: d,
    };
  }
  const inset = CORNER_INSET * width;
  const left = camera.corner.endsWith("left");
  const top = camera.corner.startsWith("top");
  return {
    x: left ? inset : width - inset - d,
    y: top ? inset : height - inset - d,
    width: d,
    height: d,
  };
}

// The CSS gradient line for an angle: through the centre, long enough that
// the corners land on 0% and 100%.
export function gradientLine(
  width: number,
  height: number,
  angleDeg: number,
): { x0: number; y0: number; x1: number; y1: number } {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(a);
  const dy = -Math.cos(a);
  const half =
    (Math.abs(width * Math.sin(a)) + Math.abs(height * Math.cos(a))) / 2;
  const cx = width / 2;
  const cy = height / 2;
  return {
    x0: cx - dx * half,
    y0: cy - dy * half,
    x1: cx + dx * half,
    y1: cy + dy * half,
  };
}

export function coverRect(
  srcWidth: number,
  srcHeight: number,
  box: Rect,
): Rect {
  const scale = Math.max(box.width / srcWidth, box.height / srcHeight);
  const width = srcWidth * scale;
  const height = srcHeight * scale;
  return {
    x: box.x + (box.width - width) / 2,
    y: box.y + (box.height - height) / 2,
    width,
    height,
  };
}

export function needsRender(
  config: RecordingConfig,
  hasWebcam: boolean,
): boolean {
  return (
    config.background !== "transparent" ||
    config.cuts.length > 0 ||
    config.systemMuted ||
    hasWebcam
  );
}

/*
 * Adds a decoded buffer into an output window, mapped through one kept
 * segment. Positions are whole sample indices so adjacent buffers tile
 * exactly; a float time per sample drops one at every join, which is heard
 * as hiss. `out` holds one array per output channel, starting at output
 * sample `windowStart`. Ends that meet a cut fade over a few milliseconds so
 * the join doesn't click.
 */
const CUT_FADE_SAMPLES = 240;

export function mixInto(
  out: Float32Array[],
  outRate: number,
  windowStart: number,
  source: { channels: Float32Array[]; sampleRate: number; timestamp: number },
  segment: KeptSegment,
  fade: { in: boolean; out: boolean } = { in: false, out: false },
): void {
  const length = out[0]?.length ?? 0;
  const srcLength = source.channels[0]?.length ?? 0;
  if (!length || !srcLength) return;
  const rate = source.sampleRate;
  const step = rate / outRate;
  const bufferStart = Math.round(source.timestamp * rate);
  const segOut = Math.round(segment.outStart * outRate);
  const segLength = Math.round((segment.srcEnd - segment.srcStart) * outRate);
  const segSrc = segment.srcStart * rate;
  const firstK = Math.ceil((bufferStart - segSrc) / step) + segOut;
  const k0 = Math.max(windowStart, segOut, firstK - 1);
  const k1 = Math.min(windowStart + length, segOut + segLength);
  for (let c = 0; c < out.length; c++) {
    const dst = out[c]!;
    const src = source.channels[Math.min(c, source.channels.length - 1)]!;
    for (let k = k0; k < k1; k++) {
      const pos = segSrc + (k - segOut) * step - bufferStart;
      const i = step === 1 ? Math.round(pos) : Math.floor(pos);
      if (i < 0) continue;
      if (i >= srcLength) break;
      const value =
        step === 1 || i + 1 >= srcLength
          ? src[i]!
          : src[i]! + (src[i + 1]! - src[i]!) * (pos - i);
      const gain = Math.min(
        1,
        fade.in ? (k - segOut + 1) / CUT_FADE_SAMPLES : 1,
        fade.out ? (segOut + segLength - k) / CUT_FADE_SAMPLES : 1,
      );
      dst[k - windowStart] = dst[k - windowStart]! + value * gain;
    }
  }
}
