"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import type { VideoPlayerStore } from "@videojs/core/dom";
import { selectFullscreen } from "@videojs/react";
import { Video, VideoPlayer, usePlayer } from "@videojs/react/video";
import type { RecordingConfig } from "@/lib/recording-config";
import {
  chapterCues,
  cuesToTrackUrl,
  selectionCue,
} from "@/lib/recording/chapter-cues";
import { snapOutOfCuts, type RecordingCut } from "@/lib/recording/cuts";
import type { RecordingChapter } from "@/lib/recording/summary-chapters";
import { cn } from "@/lib/utils";
import { aspectFromPlaceholder, sizeStyleForAspect } from "./layout";
import { RecordingSkin, type ProgressOverlayInfo } from "./RecordingSkin";
import { useCutSkipper } from "./use-cut-skipper";
import { useWebcamSync } from "./use-webcam-sync";

export type { ProgressOverlayInfo } from "./RecordingSkin";

import { splitMute, type SplitMute } from "@/lib/recording/split-mute";
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
  // Render slot over the time slider; the public viewer uses it to plot reaction dots.
  progressOverlay?: (info: ProgressOverlayInfo) => ReactNode;
  // Render slot over the whole player that stays visible when the controls hide.
  floatingOverlay?: (info: ProgressOverlayInfo) => ReactNode;
  // Content below the player, inside the outer flex column. Hidden in fullscreen (only the player container goes fullscreen). The public viewer uses it for the reaction bar.
  belowPlayer?: ReactNode;
  controlsExtra?: ReactNode;
  controlsAlwaysVisible?: boolean;
  compactControls?: boolean;
  // The frame under the pointer above the time slider; the editor's timeline
  // already shows the frames.
  framePreview?: boolean;
  // WebVTT captions, shown from the start; the CC button or `c` hides them.
  captionsUrl?: string;
  captionsLang?: string;
  // Sections of the time slider, with their titles in the hover preview.
  chapters?: RecordingChapter[];
  // A span the editor is about to cut, drawn as its own red segment of the
  // time slider in place of the chapters.
  selection?: RecordingCut | null;
  // Keeps the real timeline and marks the cut spans on it (the editor).
  // Otherwise the slider and clock run on the edited timeline.
  showCuts?: boolean;
  // Viewport-aware max-height for LANDSCAPE sources, e.g. 'min(34rem, calc(100vh - 19rem))'. The public viewer passes this so the reaction bar below the player stays in view without scrolling; the editor omits it so the preview fills the available panel height.
  landscapeMaxHeightCss?: string;
  // Takes the whole of its parent instead of sizing from the aspect; the
  // video letterboxes on the background (the editor's canvas).
  fill?: boolean;
  className?: string;
};

const FILL_STYLE: CSSProperties = { width: "100%", height: "100%" };

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
      floatingOverlay,
      belowPlayer,
      controlsExtra,
      controlsAlwaysVisible = false,
      compactControls = false,
      framePreview = true,
      captionsUrl,
      captionsLang,
      chapters,
      selection,
      showCuts = false,
      landscapeMaxHeightCss,
      fill = false,
      className,
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
    const cues = useMemo(
      () =>
        selection
          ? [selectionCue(selection)]
          : chapterCues(chapters ?? [], serverDurationMs),
      [selection, chapters, serverDurationMs],
    );
    const cuesUrl = useMemo(
      () => (cues.length > 0 ? cuesToTrackUrl(cues) : null),
      [cues],
    );

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

    const aspect =
      actualAspect ?? aspectFromPlaceholder(serverWidth, serverHeight);
    const sizeStyle = fill
      ? FILL_STYLE
      : sizeStyleForAspect(aspect, landscapeMaxHeightCss);

    // "System sound off" silences the screen track underneath the player's
    // own mute, so the mute button and the mic stay the viewer's.
    const splitRef = useRef<SplitMute | null>(null);
    useEffect(() => {
      const main = videoRef.current;
      if (!main) return;
      const split = splitMute(main);
      splitRef.current = split;
      return () => {
        splitRef.current = null;
        split.release();
      };
    }, []);
    useEffect(() => {
      splitRef.current?.setSystemMuted(config.systemMuted);
    }, [config.systemMuted]);

    return (
      <div
        className={cn(
          "flex flex-col items-center",
          fill ? "h-full w-full" : "max-lg:contents",
        )}
      >
        <VideoPlayer>
          <StoreBridge storeRef={storeRef} />
          <RecordingSkin
            className={className}
            sizeStyle={sizeStyle}
            aspect={aspect}
            background={config.background}
            webcam={
              webcamUrl
                ? {
                    url: webcamUrl,
                    corner: config.cameraCorner,
                    size: config.cameraSize,
                    hidden: config.cameraHidden,
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
            cues={cues}
            videoUrl={videoUrl}
            framePreview={framePreview}
            previewLoopUrl={compactControls ? videoUrl : undefined}
            progressOverlay={progressOverlay}
            floatingOverlay={floatingOverlay}
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
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                if (v.videoWidth > 0 && v.videoHeight > 0) {
                  setActualAspect(v.videoWidth / v.videoHeight);
                }
              }}
            >
              {captionsUrl ? (
                <track
                  key={captionsUrl}
                  kind="captions"
                  src={captionsUrl}
                  srcLang={captionsLang ?? "en"}
                  label="Captions"
                  default
                />
              ) : null}
              {cuesUrl ? (
                <track key={cuesUrl} kind="chapters" src={cuesUrl} default />
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
