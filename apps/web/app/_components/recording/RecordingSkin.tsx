"use client";

import {
  Controls,
  Hotkey,
  PlaybackRateButton as PlaybackRateButtonPrimitive,
  SeekButton as SeekButtonPrimitive,
  Time,
  Tooltip,
  selectControls,
  selectFullscreen,
  selectPlayback,
  selectPlaybackRate,
  selectTime,
} from "@videojs/react";
import { SeekIcon } from "@videojs/react/icons";
import { usePlayer } from "@videojs/react/video";
import { Play, RotateCcw } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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
import { AudioTrackMenu } from "@/components/videojs/ui/audio-track-menu";
import { PlaybackRateSubmenu } from "@/components/videojs/ui/playback-rate-submenu";
import { QualityMenu } from "@/components/videojs/ui/quality-menu";
import { SettingsMenu } from "@/components/videojs/ui/settings-menu";
import { CaptionsMenu } from "./CaptionsMenu";
import "./player.css";
import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/format";
import {
  SELECTION_CUE_ID,
  type ChapterCue,
} from "@/lib/recording/chapter-cues";
import {
  effectiveDurationMs,
  toEditedMs,
  toSourceMs,
  type RecordingCut,
} from "@/lib/recording/cuts";
import { EditedTimeSlider } from "./EditedTimeSlider";
import { FramePreview } from "./FramePreview";
import { useFitStage } from "./use-fit-stage";
import { useFrameStrip } from "./use-frame-strip";
import { recordingBackgroundStyle } from "./layout";
import { WebcamBubble, type RecordingWebcam } from "./WebcamBubble";
import type { CaptionPrefs } from "@/lib/recording/caption-prefs";

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

export type { RecordingWebcam };

export type RecordingSkinProps = {
  children: ReactNode;
  className?: string;
  sizeStyle: CSSProperties;
  aspect: number;
  background: string;
  captionPrefs: CaptionPrefs;
  onCaptionPrefs: (patch: Partial<CaptionPrefs>) => void;
  webcam: RecordingWebcam | null;
  webcamRef: RefObject<HTMLVideoElement | null>;
  syncingCamera: boolean;
  compact: boolean;
  alwaysVisible: boolean;
  serverDurationMs: number | null;
  cuts: RecordingCut[];
  showCuts: boolean;
  cues: ChapterCue[];
  videoUrl: string;
  // Shows the frame under the pointer above the time slider.
  framePreview: boolean;
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
// Captions ride above the full-width bar while the controls show; the stock
// value only clears the stock pill.
const CAPTION_LIFT = {
  "--media-caption-controls-y": "calc(var(--media-spacing) * -22)",
} as CSSProperties;
// Top captions hang a little under the edge and stay put when the controls
// show; the size is read by globals.css off data-caption-size.
const CAPTION_TOP = {
  "--media-caption-track-y": "calc(var(--media-spacing) * 3)",
  "--media-caption-controls-y": "calc(var(--media-spacing) * 3)",
} as CSSProperties;
// Only the slider fill and the bottom line take the brand blue; the skin's
// accent would also tint the buttons.
const FILL_COLOR = "#2563eb";
const PREVIEW_LOOP_SECONDS = 4;

/*
 * The stock Video.js video skin (vendored under components/videojs) with the
 * recording-specific layers added: the background frame, the webcam PiP, the
 * reaction overlay slot above the time slider, extra controls, 5s seek steps
 * and a compact variant for embeds.
 */
export function RecordingSkin({
  children,
  className,
  sizeStyle,
  aspect,
  background,
  captionPrefs,
  onCaptionPrefs,
  webcam,
  webcamRef,
  syncingCamera,
  compact,
  alwaysVisible,
  serverDurationMs,
  cuts,
  showCuts,
  cues,
  videoUrl,
  framePreview,
  previewLoopUrl,
  progressOverlay,
  floatingOverlay,
  controlsExtra,
}: RecordingSkinProps) {
  const isFullscreen = usePlayer(selectFullscreen)?.isFullscreen ?? false;
  const controlsVisible = usePlayer(selectControls)?.controlsVisible ?? true;
  const timeline = useTimeline(serverDurationMs, cuts, showCuts);
  const hasFrame = background !== "transparent";
  const stage = useFitStage(hasFrame, aspect);

  return (
    <Container
      className={cn(
        "@container block max-sm:h-auto! max-sm:w-full!",
        isFullscreen && "rounded-none",
        className,
      )}
      style={{
        ...(isFullscreen ? {} : sizeStyle),
        ...recordingBackgroundStyle(background),
        ...(captionPrefs.position === "top" ? CAPTION_TOP : CAPTION_LIFT),
      }}
      data-theme="default"
      data-preset="video"
      data-caption-size={captionPrefs.size}
      data-caption-position={captionPrefs.position}
    >
      {/* With a background the video shrinks 4% per side so the bg paints
          as a visible frame; `transparent` fills edge-to-edge. The stage
          keeps the video's aspect, centred, so the frame stays even in a box
          of another shape (fullscreen, the editor's stage). */}
      <div
        ref={stage.ref}
        className="absolute inset-0 m-auto"
        style={stage.style}
      >
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
      </div>

      {webcam ? <WebcamBubble webcam={webcam} videoRef={webcamRef} /> : null}

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
        videoUrl={videoUrl}
        framePreview={framePreview}
        controlsVisible={controlsVisible}
        progressOverlay={progressOverlay}
        controlsExtra={controlsExtra}
        captionLook={{ prefs: captionPrefs, onChange: onCaptionPrefs }}
      />

      <BottomProgress timeline={timeline} hidden={controlsVisible} />
      <RecordingHotkeys />
      <VideoGestures />
      <VideoStatusIndicators />
    </Container>
  );
}

// A hairline along the bottom edge that stands in for the slider while the
// controls are hidden.
function BottomProgress({
  timeline,
  hidden,
}: {
  timeline: Timeline;
  hidden: boolean;
}) {
  const { currentSeconds, durationSeconds } = timeline;
  const fraction =
    durationSeconds > 0 ? Math.min(1, currentSeconds / durationSeconds) : 0;
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1.5 transition-opacity duration-media-controls ease-out",
        hidden && "opacity-0",
      )}
      data-bottom-progress
      aria-hidden="true"
    >
      <div
        className="h-full"
        style={{ width: `${fraction * 100}%`, backgroundColor: FILL_COLOR }}
      />
    </div>
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
      className="group absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-black/10 transition-colors hover:bg-black/20 focus:outline-none"
      aria-label="Play"
    >
      {/* The same button as the landing page's demo. */}
      {compact ? (
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 shadow-2xl shadow-blue-950/40 ring-8 ring-blue-600/30 transition-transform duration-200 ease-out group-hover:scale-[1.06] motion-reduce:transition-none">
          <Play className="size-9 translate-x-0.5 fill-white text-white" />
        </span>
      ) : (
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 shadow-2xl shadow-blue-950/40 ring-[10px] ring-blue-600/30 transition-transform duration-200 ease-out group-hover:scale-[1.06] motion-reduce:transition-none sm:h-28 sm:w-28">
          <Play className="size-10 translate-x-0.5 fill-white text-white sm:size-11" />
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
      className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2"
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
  "tabular-nums transition-opacity duration-media-slow ease-out data-unavailable:opacity-50";

// Current / total time, in place of Time.Value: it runs on the edited
// timeline and knows the duration before the media does.
function ClockTime({
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
  videoUrl: string;
  framePreview: boolean;
  controlsVisible: boolean;
  progressOverlay?: (info: ProgressOverlayInfo) => ReactNode;
  controlsExtra?: ReactNode;
  captionLook: {
    prefs: CaptionPrefs;
    onChange: (patch: Partial<CaptionPrefs>) => void;
  };
};

function RateButton() {
  const rate = usePlayer(selectPlaybackRate)?.playbackRate ?? 1;
  return (
    <ButtonTooltip side="top">
      <PlaybackRateButtonPrimitive
        render={<Button />}
        className="text-[13px] font-semibold tabular-nums"
      >
        {Number.isInteger(rate) ? rate : rate.toFixed(2).replace(/0$/, "")}×
      </PlaybackRateButtonPrimitive>
    </ButtonTooltip>
  );
}

/*
 * A bar along the bottom edge over the controls gradient: the time slider
 * runs edge to edge on top, then transport on the left, the clock in the
 * middle and the toggles on the right. The compact variant (embeds) keeps
 * play, volume, the slot for inline reactions and fullscreen.
 */
function RecordingControls({
  compact,
  alwaysVisible,
  timeline,
  cuts,
  cues,
  videoUrl,
  framePreview,
  controlsVisible,
  progressOverlay,
  controlsExtra,
  captionLook,
}: RecordingControlsProps) {
  const { edited, durationSeconds, currentSeconds, toTimelineMs } = timeline;
  // The editor's selection replaces the chapters on the track, so any cue
  // present is the selection.
  const selecting = cues.some((cue) => cue.id === SELECTION_CUE_ID);
  const frames = useFrameStrip(framePreview ? videoUrl : null);
  const sourceSecondsAt = useCallback(
    (fraction: number) => {
      const seconds = fraction * durationSeconds;
      return edited ? toSourceMs(seconds * 1000, cuts) / 1000 : seconds;
    },
    [edited, durationSeconds, cuts],
  );
  const preview = framePreview ? (
    <FramePreview strip={frames} sourceSecondsAt={sourceSecondsAt} />
  ) : undefined;

  return (
    <Controls.Root visibility={alwaysVisible ? "always" : "auto"}>
      {/* Only the toolbar strip darkens; the picture above stays as it is. */}
      <Controls.Backdrop
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-36 rounded-b-[inherit]",
          "bg-[linear-gradient(to_top,rgba(0,0,0,0.6),rgba(0,0,0,0.25)_50%,transparent)]",
          "transition-opacity duration-media-controls ease-out not-data-visible:opacity-0",
        )}
      />
      <Controls.Content
        className={cn(
          "video-controls group/controls absolute inset-x-0 bottom-0 z-30 flex flex-col",
          "text-media-controls-foreground text-shadow-media",
          "transition-[opacity,translate] duration-media-controls-enter ease-out",
          "not-data-visible:pointer-events-none not-data-visible:translate-y-2 not-data-visible:opacity-0",
          "not-data-visible:duration-media-controls",
        )}
      >
        <Tooltip.Provider>
          <div
            className="group/bar relative flex items-center [--media-slider-height:--spacing(5)]"
            style={{ "--media-primary": FILL_COLOR } as CSSProperties}
          >
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
                preview={preview}
              />
            ) : (
              <>
                <TimeSlider
                  className="rounded-none"
                  previewOverflow="clamp"
                  isChapterSelected={(chapter) => selecting && !!chapter.cue}
                  preview={preview}
                />
                <CutGaps cuts={cuts} durationSeconds={durationSeconds} />
              </>
            )}
          </div>

          <Controls.Group className="relative flex items-center gap-0.5 px-1.5 pt-0.5 pb-1.5 rtl:flex-row-reverse media-lg:px-2 media-lg:pb-2">
            <ButtonTooltip side="top">
              <PlayButton />
            </ButtonTooltip>
            {compact ? null : (
              <>
                <SeekStepButton seconds={-SKIP_SECONDS} />
                <SeekStepButton seconds={SKIP_SECONDS} />
              </>
            )}
            <VolumePopover />

            {compact ? null : (
              <div className="pointer-events-none absolute inset-x-0 flex justify-center media-max-lg:hidden">
                <span className="flex items-center gap-1.5 text-sm font-medium tabular-nums">
                  <ClockTime
                    type="current"
                    cuts={edited ? cuts : []}
                    durationSeconds={durationSeconds}
                  />
                  <span className="opacity-60">/</span>
                  <ClockTime
                    type="duration"
                    cuts={edited ? cuts : []}
                    durationSeconds={durationSeconds}
                  />
                </span>
              </div>
            )}

            <div className="flex-1" />

            {controlsExtra}

            {compact ? null : (
              <>
                <ButtonTooltip side="top">
                  <CaptionsButton />
                </ButtonTooltip>
                <RateButton />
                <SettingsMenu>
                  <QualityMenu />
                  <AudioTrackMenu />
                  <PlaybackRateSubmenu />
                  <CaptionsMenu
                    prefs={captionLook.prefs}
                    onChange={captionLook.onChange}
                  />
                </SettingsMenu>
                <ButtonTooltip side="top">
                  <CastButton className="media-max-lg:hidden" />
                </ButtonTooltip>
                <ButtonTooltip side="top">
                  <AirPlayButton className="media-max-lg:hidden" />
                </ButtonTooltip>
                <ButtonTooltip side="top">
                  <PiPButton className="media-max-lg:hidden" />
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
