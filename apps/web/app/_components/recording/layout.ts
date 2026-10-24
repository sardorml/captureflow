import type { CSSProperties } from "react";
import {
  isRecordingGradientKey,
  isRecordingHexColor,
  RECORDING_GRADIENT_PRESETS,
  recordingGradientCss,
  type RecordingCameraCorner,
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
export function webcamSizeClass(size: RecordingCameraSize): string {
  switch (size) {
    case "small":
      return "w-[12%] min-w-[80px] max-w-[140px]";
    case "medium":
      return "w-[16%] min-w-[110px] max-w-[200px]";
    case "large":
      return "w-[22%] min-w-[150px] max-w-[280px]";
  }
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
