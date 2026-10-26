"use client";

import { useEffect, useState } from "react";
import { planFrameTimes } from "@/lib/recording/frame-strip";

export type FrameStrip = {
  tiles: ImageBitmap[];
  times: number[];
  width: number;
  height: number;
};

const TILE_WIDTH = 256;
// Lets the main video get going before a second element pulls at the file.
// A caller that already knows the player is ready passes 0 instead.
const START_DELAY_MS = 2000;
const SEEK_TIMEOUT_MS = 8000;

/*
 * Grabs one frame per span of the recording from a hidden video element for
 * the slider's hover preview. Drawing a cross-origin frame taints a canvas but
 * still displays, so no CORS headers are needed on the media host; the
 * bitmaps are only ever drawn, never read back.
 */
export function useFrameStrip(
  videoUrl: string | null,
  startDelayMs = START_DELAY_MS,
): FrameStrip | null {
  const [strip, setStrip] = useState<FrameStrip | null>(null);

  useEffect(() => {
    if (videoUrl === null || typeof createImageBitmap !== "function") return;
    let cancelled = false;
    const tiles: ImageBitmap[] = [];
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.src = videoUrl;

    const grab = async (): Promise<void> => {
      if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
        await nextEvent(video, "loadedmetadata", SEEK_TIMEOUT_MS);
      }
      const times = planFrameTimes(video.duration);
      if (times.length === 0 || video.videoWidth === 0) return;
      const width = TILE_WIDTH;
      const height = Math.round((video.videoHeight * width) / video.videoWidth);
      for (const t of times) {
        if (cancelled) return;
        video.currentTime = t + 0.05;
        await nextEvent(video, "seeked", SEEK_TIMEOUT_MS);
        if (cancelled) return;
        tiles.push(
          await createImageBitmap(video, {
            resizeWidth: width,
            resizeHeight: height,
            resizeQuality: "medium",
          }),
        );
      }
      if (!cancelled) setStrip({ tiles, times, width, height });
    };

    const timer = window.setTimeout(() => {
      grab().catch(() => {});
    }, startDelayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      video.removeAttribute("src");
      video.load();
      setStrip(null);
      for (const tile of tiles) tile.close();
    };
  }, [videoUrl, startDelayMs]);

  return strip;
}

function nextEvent(
  target: EventTarget,
  name: string,
  timeoutMs: number,
): Promise<void> {
  return new Promise((resolve) => {
    const done = (): void => {
      window.clearTimeout(timer);
      target.removeEventListener(name, done);
      resolve();
    };
    const timer = window.setTimeout(done, timeoutMs);
    target.addEventListener(name, done, { once: true });
  });
}
