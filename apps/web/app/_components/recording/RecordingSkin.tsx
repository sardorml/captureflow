"use client";

import {
  Controls,
  Hotkey,
  SeekButton as SeekButtonPrimitive,
  Time,
  Tooltip,
  selectControls,
  selectFullscreen,
  selectPlayback,
  selectTime,
} from "@videojs/react";
import { SeekIcon } from "@videojs/react/icons";
import { usePlayer } from "@videojs/react/video";
import { Play, RotateCcw } from "lucide-react";
import {
  useMemo,
  type CSSProperties,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
} from "react";
import { AirPlayButton } from "@/components/videojs/ui/airplay-button";
import { BufferingIndicator } from "@/components/videojs/ui/buffering-indicator";
import { Button } from "@/components/videojs/ui/button";
import { ButtonTooltip } from "@/components/videojs/ui/button-tooltip";
import { CaptionsButton } from "@/components/videojs/ui/captions-button";
import { CastButton } from "@/components/videojs/ui/cast-button";
import { Container } from "@/components/videojs/ui/container";
import { ErrorDialog } from "@/components/videojs/ui/error-dialog";
import { FullscreenButton } from "@/components/videojs/ui/fullscreen-button";
import { PiPButton } from "@/components/videojs/ui/pip-button";
import { PlayButton } from "@/components/videojs/ui/play-button";
import { Poster } from "@/components/videojs/ui/poster";
import { TimeSlider } from "@/components/videojs/ui/time-slider";
import { VolumePopover } from "@/components/videojs/ui/volume-popover";
import { VideoGestures } from "@/components/videojs/video/behaviors/gestures";
import { VideoStatusIndicators } from "@/components/videojs/video/display/status-indicators";
import { VideoSettingsMenu } from "@/components/videojs/video/menus/settings-menu";
import { cn } from "@/lib/utils";
import type {
  RecordingCameraCorner,
  RecordingCameraSize,
} from "@/lib/recording-config";
import { formatTimestamp } from "@/lib/format";
import {
  SELECTION_CUE_ID,
  type ChapterCue,
} from "@/lib/recording/chapter-cues";
import {
  effectiveDurationMs,
  toEditedMs,
  type RecordingCut,
} from "@/lib/recording/cuts";
import { EditedTimeSlider } from "./EditedTimeSlider";
import {
  recordingBackgroundStyle,
  webcamCornerClass,
  webcamSizeClass,
} from "./layout";

// Info handed to the progressOverlay slot, which covers the time slider so
// the public viewer can place reaction markers on it without forking the
// player. `toTimelineMs` maps a recording time onto whatever timeline the
// slider shows (the edited one in the viewer); `currentSeconds` is already
// on that timeline.
export type ProgressOverlayInfo = {
  durationSeconds: number;
  currentSeconds: number;
  controlsVisible: boolean;
  toTimelineMs: (sourceMs: number) => number;
};

export type RecordingWebcam = {
  url: string;
  corner: RecordingCameraCorner;
  size: RecordingCameraSize;
};

export type RecordingSkinProps = {
  children: ReactNode;
  sizeStyle: CSSProperties;
  background: string;
  webcam: RecordingWebcam | null;
  webcamRef: RefObject<HTMLVideoElement | null>;
  syncingCamera: boolean;
  compact: boolean;
  alwaysVisible: boolean;
  serverDurationMs: number | null;
  cuts: RecordingCut[];
  showCuts: boolean;
  cues: ChapterCue[];
  previewLoopUrl?: string;
  progressOverlay?: (info: ProgressOverlayInfo) => ReactNode;
  // Covers the whole player and stays put when the controls hide.
  floatingOverlay?: (info: ProgressOverlayInfo) => ReactNode;
  controlsExtra?: ReactNode;
};

type Timeline = Omit<ProgressOverlayInfo, "controlsVisible"> & {
  edited: boolean;
};

const SKIP_SECONDS = 5;
const identityMs = (ms: number): number => ms;
const PREVIEW_LOOP_SECONDS = 4;

/*
 * The stock Video.js video skin (vendored under components/videojs) with the
 * recording-specific layers added: the background frame, the webcam PiP, the
 * reaction overlay slot above the time slider, extra controls, 5s seek steps
 * and a compact variant for embeds.
 */
export function RecordingSkin({
  children,
  sizeStyle,
  background,
  webcam,
  webcamRef,
  syncingCamera,
  compact,
  alwaysVisible,
  serverDurationMs,
  cuts,
  showCuts,
  cues,
  previewLoopUrl,
  progressOverlay,
  floatingOverlay,
  controlsExtra,
}: RecordingSkinProps) {
  const isFullscreen = usePlayer(selectFullscreen)?.isFullscreen ?? false;
  const controlsVisible = usePlayer(selectControls)?.controlsVisible ?? true;
  const timeline = useTimeline(serverDurationMs, cuts, showCuts);
  const hasFrame = background !== "transparent";

  return (
    <Container
      className={cn(
        "@container block max-sm:h-auto! max-sm:w-full!",
        isFullscreen && "rounded-none",
      )}
      style={
        isFullscreen
          ? undefined
          : { ...sizeStyle, ...recordingBackgroundStyle(background) }
      }
      data-theme="default"
      data-preset="video"
    >
      {/* With a background the video shrinks 4% per side so the bg paints
          as a visible frame; `transparent` fills edge-to-edge. */}
      <div
        className={
          hasFrame
            ? "absolute inset-[4%] overflow-hidden rounded-lg shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]"
            : "absolute inset-0"
        }
      >
        {children}
        <Poster />
        {previewLoopUrl ? <PreviewLoop url={previewLoopUrl} /> : null}
      </div>

      {/* No z-index: the controls layers stack above it like a real PiP. */}
      {webcam ? (
        <video
          ref={webcamRef}
          src={webcam.url}
          className={cn(
            "pointer-events-none absolute aspect-square rounded-full object-cover",
            webcamCornerClass(webcam.corner),
            webcamSizeClass(webcam.size),
          )}
          playsInline
          preload="auto"
        />
      ) : null}

      <BufferingIndicator />
      <ErrorDialog />
      <StartOverlay compact={compact} />

      {syncingCamera ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <span className="block h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      ) : null}

      {floatingOverlay ? (
        <div className="pointer-events-none absolute inset-0 z-20">
          {floatingOverlay({ ...timeline, controlsVisible })}
        </div>
      ) : null}

      <RecordingControls
        compact={compact}
        alwaysVisible={alwaysVisible}
        timeline={timeline}
        cuts={cuts}
        cues={cues}
        progressOverlay={progressOverlay}
        controlsExtra={controlsExtra}
      />

      <RecordingHotkeys />
      <VideoGestures />
      <VideoStatusIndicators />
    </Container>
  );
}

// Compact players (embeds) loop the first seconds muted until the first
// play, in place of a static poster.
function PreviewLoop({ url }: { url: string }) {
  const started = usePlayer(selectPlayback)?.started ?? false;
  if (started) return null;
  return (
    <video
      src={url}
      className="pointer-events-none absolute inset-0 block h-full w-full object-contain"
      muted
      autoPlay
      loop
      playsInline
      aria-hidden="true"
      onTimeUpdate={(e) => {
        if (e.currentTarget.currentTime >= PREVIEW_LOOP_SECONDS) {
          e.currentTarget.currentTime = 0;
        }
      }}
    />
  );
}

// Stops the container's tap gesture from also toggling playback.
function stopPropagation(e: SyntheticEvent): void {
  e.stopPropagation();
}

function StartOverlay({ compact }: { compact: boolean }) {
  const playback = usePlayer(selectPlayback);
  const time = usePlayer(selectTime);
  if (!playback) return null;

  if (playback.ended) {
    return (
      <button
        type="button"
        onPointerDown={stopPropagation}
        onPointerUp={stopPropagation}
        onClick={(e) => {
          e.stopPropagation();
          void time?.seek(0);
          void playback.play();
        }}
        className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-black/55 backdrop-blur-[1px] focus:outline-none"
        aria-label="Watch again"
      >
        <span className="flex items-center gap-3 text-white">
          <RotateCcw className="h-7 w-7" />
          <span className="text-xl font-semibold">Watch again</span>
        </span>
      </button>
    );
  }

  if (playback.started) return null;
  return (
    <button
      type="button"
      onPointerDown={stopPropagation}
      onPointerUp={stopPropagation}
      onClick={(e) => {
        e.stopPropagation();
        void playback.play();
      }}
      className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-black/30 focus:outline-none"
      aria-label="Play"
    >
      {compact ? (
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 shadow-2xl shadow-blue-950/40 ring-8 ring-blue-600/30 transition-transform duration-200 ease-out hover:scale-[1.06] motion-reduce:transition-none">
          <Play className="size-9 translate-x-0.5 fill-white text-white" />
        </span>
      ) : (
        <span className="flex h-32 w-32 items-center justify-center rounded-full bg-[#171717]/85 shadow-lg transition-transform hover:scale-105">
          <Play className="h-16 w-16 text-white" fill="currentColor" />
        </span>
      )}
    </button>
  );
}

function RecordingHotkeys() {
  return (
    <>
      <Hotkey keys="Space" action="togglePaused" />
      <Hotkey keys="k" action="togglePaused" />
      <Hotkey keys="m" action="toggleMuted" />
      <Hotkey keys="ArrowLeft" action="seekStep" value={-SKIP_SECONDS} />
      <Hotkey keys="j" action="seekStep" value={-SKIP_SECONDS} />
      <Hotkey keys="ArrowRight" action="seekStep" value={SKIP_SECONDS} />
      <Hotkey keys="l" action="seekStep" value={SKIP_SECONDS} />
      <Hotkey keys="ArrowUp" action="volumeStep" />
      <Hotkey keys="ArrowDown" action="volumeStep" />
      <Hotkey keys="0-9" action="seekToPercent" />
      <Hotkey keys="Home" action="seekToPercent" value={0} />
      <Hotkey keys="End" action="seekToPercent" value={100} />
      <Hotkey keys=">" action="speedUp" />
      <Hotkey keys="<" action="speedDown" />
      <Hotkey keys="f" action="toggleFullscreen" />
      <Hotkey keys="c" action="toggleSubtitles" />
      <Hotkey keys="i" action="togglePictureInPicture" />
    </>
  );
}

function SeekStepButton({ seconds }: { seconds: number }) {
  return (
    <ButtonTooltip side="top">
      <SeekButtonPrimitive
        seconds={seconds}
        render={<Button />}
        className="relative"
      >
        <SeekIcon
          className={cn(
            "size-media-icon drop-shadow-media-icon",
            seconds < 0 && "-scale-x-100",
          )}
        />
        <span className="pointer-events-none absolute mt-[1px] text-[8px] font-bold leading-none">
          {Math.abs(seconds)}
        </span>
      </SeekButtonPrimitive>
    </ButtonTooltip>
  );
}

// Hatched marks over the slider where the player will skip.
function CutGaps({
  cuts,
  durationSeconds,
}: {
  cuts: RecordingCut[];
  durationSeconds: number;
}) {
  if (cuts.length === 0 || durationSeconds <= 0) return null;
  const totalMs = durationSeconds * 1000;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-1/2 h-1 -translate-y-1/2"
    >
      {cuts.map((cut) => (
        <span
          key={cut.startMs}
          className="absolute inset-y-0 rounded-media-pill bg-[repeating-linear-gradient(135deg,rgba(0,0,0,0.75)_0_2px,rgba(255,255,255,0.55)_2px_4px)]"
          style={{
            left: `${(cut.startMs / totalMs) * 100}%`,
            width: `${((cut.endMs - cut.startMs) / totalMs) * 100}%`,
          }}
        />
      ))}
    </div>
  );
}

const TIME_CLASS =
  "tabular-nums transition-opacity duration-media-slow ease-out data-unavailable:opacity-50 @max-[16rem]/media-time:hidden";

// Current / total time on the edited timeline, in place of Time.Value which
// only knows media time.
function EditedTime({
  type,
  cuts,
  durationSeconds,
}: {
  type: "current" | "duration";
  cuts: RecordingCut[];
  durationSeconds: number;
}) {
  const currentTime = usePlayer(selectTime)?.currentTime ?? 0;
  const seconds =
    type === "current"
      ? toEditedMs(currentTime * 1000, cuts) / 1000
      : durationSeconds;
  return (
    <time
      className={TIME_CLASS}
      data-unavailable={durationSeconds > 0 ? undefined : ""}
      aria-label={type === "current" ? "Current time" : "Duration"}
    >
      {formatTimestamp(seconds * 1000)}
    </time>
  );
}

// With cuts the editor keeps the real timeline and marks them; every other
// player runs its slider and clock on the edited timeline.
function useTimeline(
  serverDurationMs: number | null,
  cuts: RecordingCut[],
  showCuts: boolean,
): Timeline {
  const time = usePlayer(selectTime);
  const duration = time?.duration ?? 0;
  const sourceSeconds =
    duration > 0 ? duration : serverDurationMs ? serverDurationMs / 1000 : 0;
  const edited = !showCuts && cuts.length > 0;
  const toTimelineMs = useMemo(
    () => (edited ? (ms: number) => toEditedMs(ms, cuts) : identityMs),
    [edited, cuts],
  );
  return {
    edited,
    durationSeconds: edited
      ? effectiveDurationMs(sourceSeconds * 1000, cuts) / 1000
      : sourceSeconds,
    currentSeconds: toTimelineMs((time?.currentTime ?? 0) * 1000) / 1000,
    toTimelineMs,
  };
}

type RecordingControlsProps = {
  compact: boolean;
  alwaysVisible: boolean;
  timeline: Timeline;
  cuts: RecordingCut[];
  cues: ChapterCue[];
  progressOverlay?: (info: ProgressOverlayInfo) => ReactNode;
  controlsExtra?: ReactNode;
};

// Layout copied from the vendored DefaultVideoControls so the look matches
// the stock skin; only the slots, the seek steps and the compact variant
// differ.
function RecordingControls({
  compact,
  alwaysVisible,
  timeline,
  cuts,
  cues,
  progressOverlay,
  controlsExtra,
}: RecordingControlsProps) {
  const controlsVisible = usePlayer(selectControls)?.controlsVisible ?? true;
  const { edited, durationSeconds, currentSeconds, toTimelineMs } = timeline;
  // The editor's selection replaces the chapters on the track, so any cue
  // present is the selection.
  const selecting = cues.some((cue) => cue.id === SELECTION_CUE_ID);

  return (
    <Controls.Root visibility={alwaysVisible ? "always" : "auto"}>
      <Controls.Backdrop
        className={cn(
          "pointer-events-none absolute inset-0 z-10 rounded-[inherit] bg-(image:--media-controls-gradient)",
          "transition-opacity duration-media-controls ease-out not-data-visible:opacity-0",
        )}
      />
      <Controls.Content
        className={cn(
          "video-controls",
          "group/controls text-media-controls-foreground text-shadow-media",
          "duration-media-controls-enter ease-out",
          "contents p-1 transition-[filter,opacity,scale,translate]",
          "media-lg:absolute media-lg:inset-x-2 media-lg:bottom-2 media-lg:z-30",
          "media-lg:flex media-lg:items-center media-lg:rtl:flex-row-reverse media-lg:rounded-media-controls",
          "media-lg:bg-media-popover media-lg:text-media-popover-foreground",
          "media-lg:surface-media media-lg:after:surface-media-inset",
          "media-2xl:inset-x-3 media-2xl:bottom-3",
          "media-lg:not-data-visible:pointer-events-none media-lg:not-data-visible:opacity-0",
          "media-lg:not-data-visible:scale-media-hidden media-lg:not-data-visible:translate-y-media-hidden-offset",
          "media-lg:pointer-fine:not-data-visible:blur-media-hidden",
          "media-lg:not-data-visible:duration-media-controls",
        )}
      >
        <Tooltip.Provider>
          <Controls.Group
            className={cn(
              "absolute inset-x-2 bottom-2 z-30 flex origin-bottom items-center rtl:flex-row-reverse rounded-media-controls p-0.5",
              "media-max-lg:bg-media-popover media-max-lg:text-media-popover-foreground",
              "media-max-lg:surface-media media-max-lg:after:surface-media-inset",
              "media-lg:contents",
              "media-max-lg:group-[:not([data-visible])]/controls:pointer-events-none",
              "media-max-lg:group-[:not([data-visible])]/controls:opacity-0",
              "media-max-lg:group-[:not([data-visible])]/controls:scale-media-hidden",
              "media-max-lg:pointer-fine:group-[:not([data-visible])]/controls:blur-media-hidden",
              "transition-[filter,opacity,scale,translate] duration-media-controls-enter ease-out",
              "media-max-lg:group-[:not([data-visible])]/controls:duration-media-controls",
              "media-max-lg:group-[:not([data-visible])]/controls:translate-y-media-hidden-offset",
            )}
          >
            <ButtonTooltip side="top">
              <PlayButton />
            </ButtonTooltip>
            {compact ? null : (
              <>
                <SeekStepButton seconds={-SKIP_SECONDS} />
                <SeekStepButton seconds={SKIP_SECONDS} />
              </>
            )}
            <VolumePopover className="ms-px" />

            <Controls.Group className="@container/media-time flex flex-1 items-center rtl:flex-row-reverse gap-2.5 px-2 media-lg:px-3">
              {compact ? null : edited ? (
                <EditedTime
                  type="current"
                  cuts={cuts}
                  durationSeconds={durationSeconds}
                />
              ) : (
                <Time.Value className={TIME_CLASS} type="current" />
              )}
              <div className="relative flex min-w-0 flex-1 items-center">
                {progressOverlay ? (
                  <div className="pointer-events-none absolute inset-0 z-10">
                    {progressOverlay({
                      durationSeconds,
                      currentSeconds,
                      controlsVisible,
                      toTimelineMs,
                    })}
                  </div>
                ) : null}
                {edited ? (
                  <EditedTimeSlider
                    cuts={cuts}
                    cues={cues}
                    durationSeconds={durationSeconds}
                  />
                ) : (
                  <>
                    <TimeSlider
                      isChapterSelected={(chapter) =>
                        selecting && !!chapter.cue
                      }
                    />
                    <CutGaps cuts={cuts} durationSeconds={durationSeconds} />
                  </>
                )}
              </div>
              {compact ? null : edited ? (
                <EditedTime
                  type="duration"
                  cuts={cuts}
                  durationSeconds={durationSeconds}
                />
              ) : (
                <Time.Value
                  className={cn(
                    "cursor-pointer rounded-sm tabular-nums focus-ring-media",
                    "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
                    "transition-[outline-color,outline-offset] duration-media-fast ease-out",
                    "focus-visible:outline-media-ring focus-visible:outline-offset-2",
                    "@max-[16rem]/media-time:hidden",
                  )}
                  type="duration"
                  toggle
                />
              )}
            </Controls.Group>

            {controlsExtra}

            {compact ? null : (
              <>
                <ButtonTooltip side="top">
                  <CaptionsButton className="media-max-lg:hidden" />
                </ButtonTooltip>
                <VideoSettingsMenu className="media-lg:ms-px" />
              </>
            )}
          </Controls.Group>

          <Controls.Group
            className={cn(
              "absolute top-2 right-2 z-30 flex origin-top items-center rtl:flex-row-reverse gap-px rounded-media-controls p-0.5",
              "media-max-lg:bg-media-popover media-max-lg:text-media-popover-foreground",
              "media-max-lg:surface-media media-max-lg:after:surface-media-inset",
              "media-lg:static media-lg:p-0",
              "media-max-lg:group-[:not([data-visible])]/controls:pointer-events-none",
              "media-max-lg:group-[:not([data-visible])]/controls:opacity-0",
              "media-max-lg:group-[:not([data-visible])]/controls:scale-media-hidden",
              "media-max-lg:pointer-fine:group-[:not([data-visible])]/controls:blur-media-hidden",
              "transition-[filter,opacity,scale,translate] duration-media-controls-enter ease-out",
              "media-max-lg:group-[:not([data-visible])]/controls:duration-media-controls",
              "media-max-lg:group-[:not([data-visible])]/controls:-translate-y-media-hidden-offset",
            )}
          >
            {compact ? null : (
              <>
                <ButtonTooltip side="top">
                  <CastButton />
                </ButtonTooltip>
                <ButtonTooltip side="top">
                  <AirPlayButton />
                </ButtonTooltip>
                <ButtonTooltip side="top">
                  <PiPButton />
                </ButtonTooltip>
              </>
            )}
            <ButtonTooltip side="top">
              <FullscreenButton />
            </ButtonTooltip>
          </Controls.Group>
        </Tooltip.Provider>
      </Controls.Content>
    </Controls.Root>
  );
}
