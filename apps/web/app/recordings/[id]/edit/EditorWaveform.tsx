"use client";

import { useLayoutEffect, useRef } from "react";
import { peakBetween } from "@/lib/recording/waveform";

const BASELINE_PX = 1;
const SMOOTHING_RADIUS = 2;
const EDGE_PADDING_PX = 4;

/*
 * One clip's stretch of the audio, `from` to `to` as fractions of the
 * recording: a filled silhouette mirrored around the middle. Columns are cut
 * from a grid over the whole lane rather than over this clip, so dragging a
 * clip's edge reveals more of the same shape instead of resampling it, and it
 * redraws before paint because setting a canvas's size blanks it.
 */
export function EditorWaveform({
  buckets,
  from,
  to,
}: {
  buckets: Float32Array | null;
  from: number;
  to: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas || !buckets) return;
    const draw = (): void => {
      const { width, height } = canvas.getBoundingClientRect();
      const laneWidth = canvas.closest<HTMLElement>(
        "[data-timeline-lane]",
      )?.clientWidth;
      if (width === 0 || height === 0 || !laneWidth) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.fillStyle = getComputedStyle(canvas).color;

      // Rounded the way the browser snaps the clip's own left edge to a pixel.
      const firstColumn = Math.round(from * laneWidth);
      const columns = Math.ceil(width) + 1;
      const peaks = Array.from(
        { length: columns + SMOOTHING_RADIUS * 2 },
        (_, i) => {
          const column = firstColumn + i - SMOOTHING_RADIUS;
          return peakBetween(
            buckets,
            Math.max(0, column / laneWidth),
            Math.min(1, (column + 1) / laneWidth),
          );
        },
      );
      const heights = Array.from({ length: columns }, (_, i) => {
        const near = peaks.slice(i, i + SMOOTHING_RADIUS * 2 + 1);
        return near.reduce((sum, peak) => sum + peak, 0) / near.length;
      });

      const middle = height / 2;
      const reach = middle - EDGE_PADDING_PX;
      ctx.beginPath();
      ctx.moveTo(0, middle);
      heights.forEach((peak, x) => ctx.lineTo(x, middle - peak * reach));
      ctx.lineTo(columns, middle);
      for (let x = columns - 1; x >= 0; x--) {
        ctx.lineTo(x, middle + heights[x]! * reach);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(0, middle - BASELINE_PX / 2, width, BASELINE_PX);
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [buckets, from, to]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full text-accent-bg"
    />
  );
}
