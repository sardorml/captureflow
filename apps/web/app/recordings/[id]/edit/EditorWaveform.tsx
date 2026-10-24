"use client";

import { useEffect, useRef } from "react";
import { peakBetween } from "@/lib/recording/waveform";

const BASELINE_PX = 1;

// The audio lane: a filled silhouette, one column per pixel, rising from a
// baseline along the bottom, in the current text colour. Redrawn whenever
// the lane is resized or zoomed.
export function EditorWaveform({ buckets }: { buckets: Float32Array | null }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !buckets) return;
    const draw = (): void => {
      const { width, height } = canvas.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.fillStyle = getComputedStyle(canvas).color;
      const columns = Math.ceil(width);
      const usable = height - BASELINE_PX;
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x < columns; x++) {
        const peak = peakBetween(buckets, x / columns, (x + 1) / columns);
        ctx.lineTo(x, height - BASELINE_PX - peak * usable);
      }
      ctx.lineTo(columns, height);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(0, height - BASELINE_PX, width, BASELINE_PX);
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [buckets]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full text-zinc-300/90"
    />
  );
}
