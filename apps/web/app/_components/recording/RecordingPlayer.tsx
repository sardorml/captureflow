"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import type { VideoPlayerStore } from "@videojs/core/dom";
import { selectFullscreen } from "@videojs/react";
import { Video, VideoPlayer, usePlayer } from "@videojs/react/video";
import type { RecordingConfig } from "@/lib/recording-config";
import { snapOutOfCuts, type RecordingCut } from "@/lib/recording/cuts";
import { aspectFromPlaceholder, sizeStyleForAspect } from "./layout";
import { RecordingSkin, type ProgressOverlayInfo } from "./RecordingSkin";
import { useCutSkipper } from "./use-cut-skipper";
import { useWebcamSync } from "./use-webcam-sync";

export type { ProgressOverlayInfo } from "./RecordingSkin";

/*
 * Imperative handle so wrapping components (e.g. the public viewer's
 * reactions layer) can read player state at click-time, bypassing
 * React's batched render cycle.
 */
export type RecordingPlayerHandle = {
  getCurrentTime(): number;
  getDuration(): number;
  // Seek and start playing, so clicking a timestamped reaction/comment lands at its moment without a second press-play.
  seekTo(seconds: number): void;
  // Seek without changing play state — the edit-page timeline scrubs the
  // playhead without yanking the video into playback on every drag frame.
  seek(seconds: number): void;
};

type Props = {
  videoUrl: string;
  posterUrl?: string;
  // Companion webcam video, rendered as a configurable PiP overlay and synced to the main player. Carries mic audio; the main video carries system audio (independently muteable). Absent when the recording had no camera (webcam_state='none') or the upload hasn't finalized.
  webcamUrl?: string;
  // Authoritative duration from the recording record, used before <video> knows its own duration.
  serverDurationMs: number | null;
  // Server-known intrinsic dimensions, used to reserve the player box at the right aspect ratio on first paint. Without this the container collapses to 0 until metadata loads, then jumps and shoves the page.
  serverWidth: number | null;
  serverHeight: number | null;
  // Persisted presentation config (bg, cam PiP corner + size, per-track mute defaults). On the edit page this is the LIVE config the sidebar mutates — changes apply immediately so the user previews exactly what the public viewer renders after Save.
  config: RecordingConfig;
  // Render slot above the time slider; the public viewer uses it to plot reaction clusters.
  progressOverlay?: (info: ProgressOverlayInfo) => ReactNode;
  // Content below the player, inside the outer flex column. Hidden in fullscreen (only the player container goes fullscreen). The public viewer uses it for the reaction bar.
  belowPlayer?: ReactNode;
  controlsExtra?: ReactNode;
  controlsAlwaysVisible?: boolean;
  compactControls?: boolean;
  // WebVTT captions, shown from the start; the CC button or `c` hides them.
  captionsUrl?: string;
  captionsLang?: string;
  // A span the editor is about to cut, drawn as its own red segment of the
  // time slider (a chapters track, so Video.js splits the slider itself).
  selection?: RecordingCut | null;
  // Keeps the real timeline and marks the cut spans on it (the editor).
  // Otherwise the slider and clock run on the edited timeline.
  showCuts?: boolean;
  // Viewport-aware max-height for LANDSCAPE sources, e.g. 'min(34rem, calc(100vh - 19rem))'. The public viewer passes this so the reaction bar below the player stays in view without scrolling; the editor omits it so the preview fills the available panel height.
  landscapeMaxHeightCss?: string;
};

export const RecordingPlayer = forwardRef<RecordingPlayerHandle, Props>(
  function RecordingPlayer(
    {
      videoUrl,
      posterUrl,
      webcamUrl,
      serverDurationMs,
      serverWidth,
      serverHeight,
      config,
      progressOverlay,
      belowPlayer,
      controlsExtra,
      controlsAlwaysVisible = false,
      compactControls = false,
      captionsUrl,
      captionsLang,
      selection,
      showCuts = false,
      landscapeMaxHeightCss,
    },
    handleRef,
  ) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const webcamRef = useRef<HTMLVideoElement | null>(null);
    const storeRef = useRef<VideoPlayerStore | null>(null);
    /*
     * Aspect ratio of the actually-encoded video, from metadata. The
     * server-known dim is only a placeholder for the SSR paint; once
     * metadata arrives the intrinsic dimensions size the box exactly so
     * object-contain shows no bars.
     */
    const [actualAspect, setActualAspect] = useState<number | null>(null);
    const cuts = config.cuts;
    const cutsRef = useRef(cuts);
    cutsRef.current = cuts;

    useImperativeHandle(
      handleRef,
      () => ({
        getCurrentTime: () => videoRef.current?.currentTime ?? 0,
        getDuration: () => {
          const v = videoRef.current;
          if (!v) return 0;
          if (Number.isFinite(v.duration) && v.duration > 0) return v.duration;
          if (v.seekable.length > 0) {
            const end = v.seekable.end(v.seekable.length - 1);
            if (Number.isFinite(end) && end > 0) return end;
          }
          return 0;
        },
        seekTo: (seconds: number) => {
          seekMedia(storeRef, videoRef, seconds, cutsRef.current);
          const store = storeRef.current;
          if (store) void store.play().catch(() => {});
          else void videoRef.current?.play().catch(() => {});
        },
        seek: (seconds: number) =>
          seekMedia(storeRef, videoRef, seconds, cutsRef.current),
      }),
      [],
    );

    useCutSkipper({ storeRef, videoRef, cuts });

    /*
     * If the browser already has the video buffered (304 from edge cache,
     * bfcache, etc.), loadedmetadata can fire before React attaches
     * handlers, leaving the box at the server placeholder aspect. Poll on
     * mount + 300ms later.
     */
    useEffect(() => {
      if (actualAspect != null) return;
      const check = (): void => {
        const v = videoRef.current;
        if (v && v.videoWidth > 0 && v.videoHeight > 0) {
          setActualAspect(v.videoWidth / v.videoHeight);
        }
      };
      check();
      const t = window.setTimeout(check, 300);
      return () => window.clearTimeout(t);
    }, [actualAspect]);

    const { syncingCamera } = useWebcamSync({
      videoRef,
      webcamRef,
      enabled: !!webcamUrl,
      micMuted: config.micMuted,
    });

    const sizeStyle = sizeStyleForAspect(
      actualAspect ?? aspectFromPlaceholder(serverWidth, serverHeight),
      landscapeMaxHeightCss,
    );

    return (
      <div className="flex flex-col items-center">
        <VideoPlayer>
          <StoreBridge storeRef={storeRef} />
          <RecordingSkin
            sizeStyle={sizeStyle}
            background={config.background}
            webcam={
              webcamUrl
                ? {
                    url: webcamUrl,
                    corner: config.cameraCorner,
                    size: config.cameraSize,
                  }
                : null
            }
            webcamRef={webcamRef}
            syncingCamera={syncingCamera}
            compact={compactControls}
            alwaysVisible={controlsAlwaysVisible}
            serverDurationMs={serverDurationMs}
            cuts={cuts}
            showCuts={showCuts}
            previewLoopUrl={compactControls ? videoUrl : undefined}
            progressOverlay={progressOverlay}
            controlsExtra={controlsExtra}
          >
            <Video
              ref={videoRef}
              src={videoUrl}
              poster={posterUrl}
              // object-contain so an aspect mismatch (server row dim vs the
              // actual encoded video) shows as a small letterbox against
              // the container bg instead of cropping content.
              className="block h-full w-full object-contain"
              playsInline
              preload="auto"
              muted={config.systemMuted}
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                if (v.videoWidth > 0 && v.videoHeight > 0) {
                  setActualAspect(v.videoWidth / v.videoHeight);
                }
              }}
            >
              {captionsUrl ? (
                <track
                  kind="captions"
                  src={captionsUrl}
                  srcLang={captionsLang ?? "en"}
                  label="Captions"
                  default
                />
              ) : null}
              {selection ? (
                <track
                  key={`${selection.startMs}-${selection.endMs}`}
                  kind="chapters"
                  src={selectionChaptersUrl(selection)}
                  default
                />
              ) : null}
            </Video>
          </RecordingSkin>
          {belowPlayer ? <BelowPlayer>{belowPlayer}</BelowPlayer> : null}
        </VideoPlayer>
      </div>
    );
  },
);

// Seeks through the store when attached so Video.js state stays in step,
// falling back to the element before the player has mounted. A target inside
// a cut lands on the cut's end instead.
// One chapter cue over the span; Video.js leaves the rest of the slider as
// uncovered segments on either side.
function selectionChaptersUrl(selection: RecordingCut): string {
  const stamp = (ms: number): string => {
    const total = Math.max(0, Math.round(ms));
    const h = Math.floor(total / 3_600_000);
    const m = Math.floor(total / 60_000) % 60;
    const s = Math.floor(total / 1_000) % 60;
    const pad = (n: number, w: number): string => String(n).padStart(w, "0");
    return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}.${pad(total % 1_000, 3)}`;
  };
  const vtt = `WEBVTT\n\n${stamp(selection.startMs)} --> ${stamp(selection.endMs)}\nSelection\n`;
  return `data:text/vtt;charset=utf-8,${encodeURIComponent(vtt)}`;
}

function seekMedia(
  storeRef: RefObject<VideoPlayerStore | null>,
  videoRef: RefObject<HTMLVideoElement | null>,
  seconds: number,
  cuts: RecordingCut[],
): void {
  const v = videoRef.current;
  if (!v) return;
  const snapped = snapOutOfCuts(seconds * 1000, cuts) / 1000;
  const clamped = Math.max(0, Math.min(snapped, v.duration || snapped));
  const store = storeRef.current;
  if (store) void store.seek(clamped).catch(() => {});
  else v.currentTime = clamped;
}

// The imperative handle lives outside the player context, so a child grabs
// the store for it.
function StoreBridge({
  storeRef,
}: {
  storeRef: RefObject<VideoPlayerStore | null>;
}) {
  const store = usePlayer();
  useEffect(() => {
    storeRef.current = store;
    return () => {
      storeRef.current = null;
    };
  }, [store, storeRef]);
  return null;
}

// Only the player container goes fullscreen, so the slot unmounts to pause
// any side-effects it carries.
function BelowPlayer({ children }: { children: ReactNode }) {
  const isFullscreen = usePlayer(selectFullscreen)?.isFullscreen ?? false;
  if (isFullscreen) return null;
  return <>{children}</>;
}
