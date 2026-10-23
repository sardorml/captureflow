"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { planWebcamSync } from "@/lib/recording/webcam-sync";

type UseWebcamSyncInput = {
  videoRef: RefObject<HTMLVideoElement | null>;
  webcamRef: RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  micMuted: boolean;
};

/*
 * Keeps the webcam PiP in step with the screen video: every frame both
 * elements are sampled and planWebcamSync (lib/recording/webcam-sync.ts)
 * decides whether to nudge, seek, or hold the screen while the cam buffers.
 * The cam also follows the main element's mute/volume so the viewer's mute
 * button silences the mic track too.
 */
export function useWebcamSync({
  videoRef,
  webcamRef,
  enabled,
  micMuted,
}: UseWebcamSyncInput): { syncingCamera: boolean } {
  const [syncingCamera, setSyncingCamera] = useState(false);
  const holdingRef = useRef(false);
  const micMutedRef = useRef(micMuted);
  micMutedRef.current = micMuted;

  useEffect(() => {
    if (!enabled) return;
    const cam = webcamRef.current;
    const main = videoRef.current;
    if (!cam || !main) return;
    cam.muted = micMuted || main.muted;
  }, [enabled, micMuted, videoRef, webcamRef]);

  useEffect(() => {
    if (!enabled) return;
    const main = videoRef.current;
    const cam = webcamRef.current;
    if (!main || !cam) return;

    let rafId = 0;
    let holdSince: number | null = null;
    let gaveUpAt: number | null = null;
    const stalled = (v: HTMLVideoElement): boolean =>
      v.seeking || v.readyState < HTMLMediaElement.HAVE_FUTURE_DATA;

    const step = (): void => {
      window.cancelAnimationFrame(rafId);
      const holding = holdingRef.current;
      const plan = planWebcamSync({
        now: performance.now(),
        playing: (holding || !main.paused) && !main.ended,
        scrubbing: main.seeking,
        main: {
          paused: main.paused,
          time: main.currentTime,
          rate: main.playbackRate,
          stalled: stalled(main),
        },
        cam: {
          paused: cam.paused,
          time: cam.currentTime,
          rate: cam.playbackRate,
          stalled: stalled(cam),
          // MediaRecorder webm often reports an Infinity duration.
          done:
            cam.ended ||
            cam.error !== null ||
            (Number.isFinite(cam.duration) &&
              main.currentTime >= cam.duration - 0.05),
        },
        holdSince,
        gaveUpAt,
      });
      holdSince = plan.holdSince;
      gaveUpAt = plan.gaveUpAt;
      if (plan.seekCamTo !== null) cam.currentTime = plan.seekCamTo;
      if (plan.camRate !== null) cam.playbackRate = plan.camRate;
      if (plan.cam === "play") cam.play().catch(() => {});
      else if (plan.cam === "pause") cam.pause();
      if (plan.hold !== holding) {
        holdingRef.current = plan.hold;
        setSyncingCamera(plan.hold);
        if (plan.hold) main.pause();
        else void main.play().catch(() => {});
      }
      rafId = window.requestAnimationFrame(step);
    };
    rafId = window.requestAnimationFrame(step);

    // rAF stops in background tabs, so pauses still reach the cam.
    const onMainPause = (): void => {
      if (!holdingRef.current) cam.pause();
    };
    // Each cam seek flushes its audio decoder (heard as stutter), so only
    // resync once the drag has landed and the drift is past a nudge.
    const onMainSeeked = (): void => {
      if (Math.abs(cam.currentTime - main.currentTime) > 0.1) {
        cam.currentTime = main.currentTime;
      }
      step();
    };
    const onMainVolume = (): void => {
      cam.muted = micMutedRef.current || main.muted;
      cam.volume = main.volume;
    };
    main.addEventListener("pause", onMainPause);
    main.addEventListener("play", step);
    main.addEventListener("seeked", onMainSeeked);
    main.addEventListener("volumechange", onMainVolume);

    return () => {
      window.cancelAnimationFrame(rafId);
      main.removeEventListener("pause", onMainPause);
      main.removeEventListener("play", step);
      main.removeEventListener("seeked", onMainSeeked);
      main.removeEventListener("volumechange", onMainVolume);
      holdingRef.current = false;
    };
  }, [enabled, videoRef, webcamRef]);

  return { syncingCamera };
}
