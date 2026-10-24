"use client";

import { useEffect, useRef } from "react";
import { frameIndexAt } from "@/lib/recording/frame-strip";
import { cn } from "@/lib/utils";
import type { FrameStrip } from "./use-frame-strip";

type Props = {
  strip: FrameStrip | null;
  // Media time under a point of the slider, as a fraction of its width.
  sourceSecondsAt: (fraction: number) => number;
};

// The frame under the pointer, shown in the slider's preview popup.
export function FramePreview({ strip, sourceSecondsAt }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawnRef = useRef(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = canvas?.closest<HTMLElement>(".group\\/slider");
    const ctx = canvas?.getContext("2d");
    if (!strip || !canvas || !root || !ctx) return;
    drawnRef.current = -1;
    const draw = (e: PointerEvent): void => {
      const rect = root.getBoundingClientRect();
      if (rect.width <= 0) return;
      const fraction = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      const idx = frameIndexAt(strip.times, sourceSecondsAt(fraction));
      const tile = strip.tiles[idx];
      if (idx === drawnRef.current || !tile) return;
      drawnRef.current = idx;
      try {
        ctx.drawImage(tile, 0, 0);
      } catch {
        drawnRef.current = -1;
      }
    };
    root.addEventListener("pointermove", draw);
    root.addEventListener("pointerdown", draw);
    return () => {
      root.removeEventListener("pointermove", draw);
      root.removeEventListener("pointerdown", draw);
    };
  }, [strip, sourceSecondsAt]);

  if (!strip) return null;
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute bottom-[calc(100%+var(--media-slider-preview-offset))] left-1/2 w-(--media-slider-preview-max-width) -translate-x-1/2",
        "translate-y-media-hidden-preview-offset scale-media-hidden-preview opacity-0",
        "origin-bottom blur-media-hidden transition-[filter,opacity,scale] duration-media-base ease-out",
        "group-data-pointing/preview:scale-100 group-data-pointing/preview:opacity-100 group-data-pointing/preview:filter-none",
        "overflow-hidden rounded-media-popup bg-media-backdrop/90 shadow-lg ring-1 ring-white/15",
        "after:pointer-events-none after:absolute after:inset-0 after:bg-(image:--media-thumbnail-gradient)",
      )}
    >
      <canvas
        ref={canvasRef}
        width={strip.width}
        height={strip.height}
        className="block h-auto w-full"
      />
    </div>
  );
}
