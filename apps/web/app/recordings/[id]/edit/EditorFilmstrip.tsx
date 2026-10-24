"use client";

import { useEffect, useRef } from "react";
import type { FrameStrip } from "@/app/_components/recording/use-frame-strip";

// The video lane of the timeline: one frame per span of the recording, each
// covering its slot, redrawn whenever the lane is resized or zoomed.
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
      const slot = width / strip.tiles.length;
      const scale = Math.max(height / strip.height, slot / strip.width);
      const tileW = strip.width * scale;
      const tileH = strip.height * scale;
      strip.tiles.forEach((tile, i) => {
        const x = i * slot;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, 0, slot, height);
        ctx.clip();
        ctx.drawImage(
          tile,
          x + (slot - tileW) / 2,
          (height - tileH) / 2,
          tileW,
          tileH,
        );
        ctx.restore();
      });
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
