"use client";

import { useEffect, useRef } from "react";
import { peakBetween } from "@/lib/recording/waveform";

const BAR_WIDTH = 2;
const BAR_GAP = 1;
const MIN_BAR_HEIGHT = 2;

// The audio lane: mirrored bars, one per few pixels, in the current text
// colour. Redrawn whenever the lane is resized or zoomed.
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
      const step = BAR_WIDTH + BAR_GAP;
      const bars = Math.floor(width / step);
      const usable = height - 4;
      for (let i = 0; i < bars; i++) {
        const peak = peakBetween(buckets, i / bars, (i + 1) / bars);
        const barHeight = Math.max(MIN_BAR_HEIGHT, peak * usable);
        ctx.fillRect(i * step, (height - barHeight) / 2, BAR_WIDTH, barHeight);
      }
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
      className="pointer-events-none absolute inset-0 h-full w-full text-white/90"
    />
  );
}
