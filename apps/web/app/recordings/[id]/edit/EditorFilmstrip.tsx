"use client";

import { useEffect, useRef } from "react";
import type { FrameStrip } from "@/app/_components/recording/use-frame-strip";

// The video lane of the timeline: frames at their own aspect laid side by
// side, each the one nearest its moment, redrawn whenever the lane is resized
// or zoomed.
export function EditorFilmstrip({ strip }: { strip: FrameStrip | null }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !strip || strip.tiles.length === 0) return;
    const draw = (): void => {
      const { width, height } = canvas.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      const tileW = (strip.width * height) / strip.height;
      for (let x = 0; x < width; x += tileW) {
        const at = (x + tileW / 2) / width;
        const index = Math.min(
          strip.tiles.length - 1,
          Math.floor(at * strip.tiles.length),
        );
        ctx.drawImage(strip.tiles[index], x, 0, tileW, height);
      }
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [strip]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
