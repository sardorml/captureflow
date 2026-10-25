import type { CSSProperties } from "react";
import {
  isRecordingGradientKey,
  isRecordingHexColor,
  RECORDING_GRADIENT_PRESETS,
  recordingGradientCss,
  type RecordingCameraCorner,
  type RecordingCameraPoint,
  type RecordingCameraSize,
} from "@/lib/recording-config";

// Pre-fix uploads always sent 1280x720 regardless of the real encoded dim, so
// a 16:10 MacBook recording reserved 16:9, then jumped down when the 16:10
// video loaded. That exact value falls back to 16:10; other rows are trusted.
export function aspectFromPlaceholder(
  width: number | null,
  height: number | null,
): number {
  if (!width || !height) return 16 / 10;
  if (width === 1280 && height === 720) return 16 / 10;
  return width / height;
}

// 4:3 (1.33), 16:10 (1.6), 16:9 (1.78) and wider count as landscape; 5:4,
// square and portrait take the capped path.
const LANDSCAPE_THRESHOLD = 1.3;

// Capped player height = 16:9 of the page-column width (max-w-4xl + px-4).
const MAX_HEIGHT_CSS = "min(31.5rem, calc((100vw - 2rem) * 9 / 16))";

/*
 * Landscape sources fill the column edge-to-edge, height from aspect-ratio;
 * with a viewport cap (public viewer) the width derives from the capped
 * height so the aspect holds. Squarish/portrait sources cap height and center
 * within the column. Mobile drops the explicit height via !h-auto so
 * aspect-ratio sizes the box instead.
 */
export function sizeStyleForAspect(
  aspect: number,
  landscapeMaxHeightCss?: string,
): CSSProperties {
  const a = Number.isFinite(aspect) && aspect > 0 ? aspect : 16 / 9;
  if (a >= LANDSCAPE_THRESHOLD) {
    if (landscapeMaxHeightCss) {
      return {
        width: `min(100%, calc(${landscapeMaxHeightCss} * ${a}))`,
        aspectRatio: a,
      };
    }
    return { width: "100%", aspectRatio: a };
  }
  return {
    height: MAX_HEIGHT_CSS,
    width: `clamp(min(360px, 100%), calc(${MAX_HEIGHT_CSS} * ${a} + 120px), 100%)`,
    aspectRatio: a,
  };
}

// The largest box of the video's aspect that fits the player's box, so the
// background frame stays even when the player is wider or taller than the
// video (fullscreen, the editor's stage).
export function fitStageSize(
  boxWidth: number,
  boxHeight: number,
  aspect: number,
): { width: number; height: number } {
  const a = Number.isFinite(aspect) && aspect > 0 ? aspect : 16 / 9;
  const width = Math.min(boxWidth, boxHeight * a);
  return { width, height: width / a };
}

// 24px inset matches the studio editor's WebcamBubble margin.
export function webcamCornerClass(corner: RecordingCameraCorner): string {
  switch (corner) {
    case "bottom-right":
      return "bottom-6 right-6";
    case "bottom-left":
      return "bottom-6 left-6";
    case "top-right":
      return "top-6 right-6";
    case "top-left":
      return "top-6 left-6";
  }
}

// A square bubble reads larger than a rectangular PiP at the same width, so
// these target ~14-18% of the canvas, matching the studio bubble.
export function webcamSizeFraction(size: RecordingCameraSize): number {
  switch (size) {
    case "small":
      return 0.12;
    case "medium":
      return 0.16;
    case "large":
      return 0.22;
  }
}

/*
 * Container units: the player box is the bubble's container. The pixel floor
 * keeps a face readable on a phone-width share page; a fluid bubble stays in
 * proportion in a small embed, where the floor would cover a quarter of it.
 */
export function webcamSizeCss(
  size: RecordingCameraSize,
  fluid = false,
): string {
  const pct = webcamSizeFraction(size) * 100;
  if (fluid) return `${pct}cqw`;
  switch (size) {
    case "small":
      return `clamp(80px, ${pct}cqw, 140px)`;
    case "medium":
      return `clamp(110px, ${pct}cqw, 200px)`;
    case "large":
      return `clamp(150px, ${pct}cqw, 280px)`;
  }
}

// Where a corner-placed bubble's centre falls, for a picture of the box:
// `half` is the bubble's half size as a fraction of the box on each axis.
export function webcamCornerPoint(
  corner: RecordingCameraCorner,
  half: { x: number; y: number },
): RecordingCameraPoint {
  const inset = 0.04;
  return {
    x: corner.endsWith("left") ? inset + half.x : 1 - inset - half.x,
    y: corner.startsWith("top") ? inset + half.y : 1 - inset - half.y,
  };
}

const CORNERS: RecordingCameraCorner[] = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];

// A centre let go this close to where a corner would put it counts as that
// corner, so a drag into a corner lands exactly where the corner buttons do.
export function webcamCornerNear(
  point: RecordingCameraPoint,
  half: { x: number; y: number },
  tolerance = 0.03,
): RecordingCameraCorner | null {
  for (const corner of CORNERS) {
    const at = webcamCornerPoint(corner, half);
    if (
      Math.abs(at.x - point.x) <= tolerance &&
      Math.abs(at.y - point.y) <= tolerance
    ) {
      return corner;
    }
  }
  return null;
}

// Places the bubble's centre at the point, kept wholly inside the box
// whatever the box's size turns out to be.
export function webcamPointStyle(
  point: RecordingCameraPoint,
  size: RecordingCameraSize,
  fluid = false,
): CSSProperties {
  const w = webcamSizeCss(size, fluid);
  const along = (fraction: number): string =>
    `clamp(0px, calc(${fraction * 100}% - ${w} / 2), calc(100% - ${w}))`;
  return { left: along(point.x), top: along(point.y) };
}

// Keeps a dragged centre where the whole bubble fits: `half` is the bubble's
// half size as a fraction of the box on each axis.
export function clampWebcamPoint(
  point: RecordingCameraPoint,
  half: { x: number; y: number },
): RecordingCameraPoint {
  const within = (v: number, h: number): number =>
    h >= 0.5 ? 0.5 : Math.min(1 - h, Math.max(h, v));
  return { x: within(point.x, half.x), y: within(point.y, half.y) };
}

// `transparent` falls through to the skin's own background; object-contain
// on the video means letterbox strips reveal this layer.
export function recordingBackgroundStyle(background: string): CSSProperties {
  if (background === "transparent") return {};
  if (isRecordingHexColor(background)) return { backgroundColor: background };
  if (isRecordingGradientKey(background)) {
    return {
      background: recordingGradientCss(
        RECORDING_GRADIENT_PRESETS[background].stops,
      ),
    };
  }
  return {};
}
