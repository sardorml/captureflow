"use client";

import { useEffect, type RefObject } from "react";
import type { VideoPlayerStore } from "@videojs/core/dom";
import {
  findCutAt,
  nextCutFrom,
  type RecordingCut,
} from "@/lib/recording/cuts";

// Seeks landing this close to a cut's end are left alone, so the snap seek
// itself can't re-trigger.
const SNAP_TOLERANCE_MS = 5;

type Args = {
  storeRef: RefObject<VideoPlayerStore | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  cuts: RecordingCut[];
};

/*
 * Jumps the playhead over each cut. `timeupdate` only fires a few times a
 * second, so the hop is scheduled from the time left until the next cut
 * rather than waiting for a tick inside it; seeks that land in a cut snap
 * to its end.
 */
export function useCutSkipper({ storeRef, videoRef, cuts }: Args): void {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || cuts.length === 0) return;

    let timer: number | null = null;
    const clearTimer = (): void => {
      if (timer !== null) window.clearTimeout(timer);
      timer = null;
    };

    const seekToMs = (ms: number): void => {
      const seconds = Math.min(
        ms / 1000,
        Number.isFinite(video.duration) ? video.duration : ms / 1000,
      );
      const store = storeRef.current;
      if (store) void store.seek(seconds).catch(() => {});
      else video.currentTime = seconds;
    };

    const schedule = (): void => {
      clearTimer();
      if (video.paused || video.seeking) return;
      const nowMs = video.currentTime * 1000;
      const cut = nextCutFrom(nowMs, cuts);
      if (!cut) return;
      if (nowMs >= cut.startMs) {
        seekToMs(cut.endMs);
        return;
      }
      const rate = video.playbackRate || 1;
      timer = window.setTimeout(
        () => {
          timer = null;
          schedule();
        },
        Math.max(0, (cut.startMs - nowMs) / rate),
      );
    };

    const onSeeked = (): void => {
      const nowMs = video.currentTime * 1000;
      const cut = findCutAt(nowMs, cuts);
      if (cut && cut.endMs - nowMs > SNAP_TOLERANCE_MS) seekToMs(cut.endMs);
      else schedule();
    };

    const rescheduleOn = ["play", "pause", "timeupdate", "ratechange"];
    for (const name of rescheduleOn) video.addEventListener(name, schedule);
    video.addEventListener("seeked", onSeeked);
    schedule();
    return () => {
      clearTimer();
      for (const name of rescheduleOn) {
        video.removeEventListener(name, schedule);
      }
      video.removeEventListener("seeked", onSeeked);
    };
  }, [storeRef, videoRef, cuts]);
}
