"use client";

import { Slider as SliderPrimitive, selectTime } from "@videojs/react";
import { usePlayer } from "@videojs/react/video";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  SliderFill,
  SliderThumb,
  SliderTrack,
} from "@/components/videojs/ui/slider";
import { formatTimestamp } from "@/lib/format";
import type { ChapterCue } from "@/lib/recording/chapter-cues";
import {
  toEditedMs,
  toSourceMs,
  type RecordingCut,
} from "@/lib/recording/cuts";
import { cn } from "@/lib/utils";

const SEEK_THROTTLE_MS = 100;
const STEP_SECONDS = 1;
const LARGE_STEP_SECONDS = 10;
const LANDED_TOLERANCE_SECONDS = 0.25;

type Props = {
  cuts: RecordingCut[];
  cues: ChapterCue[];
  durationSeconds: number;
  preview?: ReactNode;
};

type Segment = {
  key: string;
  startPercent: number;
  endPercent: number;
  title: string | null;
};

/*
 * The viewer's seek bar over the recording with its cuts removed. Video.js's
 * own TimeSlider is bound to media time, so this one runs the generic Slider
 * on edited seconds and maps every seek back to the source.
 */
export function EditedTimeSlider({
  cuts,
  cues,
  durationSeconds,
  preview,
}: Props) {
  const time = usePlayer(selectTime);
  const current = time ? toEditedMs(time.currentTime * 1000, cuts) / 1000 : 0;
  // Holds the fill at the drop point until the media lands there, so it
  // doesn't flick back to the old time while the seek is in flight.
  const [target, setTarget] = useState<number | null>(null);
  const sawSeekingRef = useRef(false);
  const lastSeekAtRef = useRef(0);
  const pendingRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const segments = useMemo(
    () => editedSegments(cues, cuts, durationSeconds),
    [cues, cuts, durationSeconds],
  );

  useEffect(() => {
    if (target == null) return;
    if (time?.seeking) {
      sawSeekingRef.current = true;
      return;
    }
    if (
      sawSeekingRef.current ||
      Math.abs(current - target) < LANDED_TOLERANCE_SECONDS
    ) {
      sawSeekingRef.current = false;
      setTarget(null);
    }
  }, [target, current, time?.seeking]);

  useEffect(
    () => () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const seek = (editedSeconds: number): void => {
    void time
      ?.seek(toSourceMs(editedSeconds * 1000, cuts) / 1000)
      .catch(() => {});
  };

  const seekThrottled = (editedSeconds: number): void => {
    const elapsed = Date.now() - lastSeekAtRef.current;
    if (elapsed >= SEEK_THROTTLE_MS && timerRef.current == null) {
      lastSeekAtRef.current = Date.now();
      seek(editedSeconds);
      return;
    }
    pendingRef.current = editedSeconds;
    if (timerRef.current != null) return;
    timerRef.current = window.setTimeout(
      () => {
        timerRef.current = null;
        const pending = pendingRef.current;
        pendingRef.current = null;
        if (pending == null) return;
        lastSeekAtRef.current = Date.now();
        seek(pending);
      },
      Math.max(0, SEEK_THROTTLE_MS - elapsed),
    );
  };

  const formatPointer = (seconds: number): string => {
    const stamp = formatTimestamp(seconds * 1000);
    const percent = durationSeconds > 0 ? (seconds / durationSeconds) * 100 : 0;
    const title = segments.find(
      (s) => percent >= s.startPercent && percent < s.endPercent,
    )?.title;
    return title ? `${title}\n${stamp}` : stamp;
  };

  return (
    <SliderPrimitive.Root
      label="Seek"
      min={0}
      max={durationSeconds}
      step={STEP_SECONDS}
      largeStep={LARGE_STEP_SECONDS}
      value={target ?? current}
      disabled={!time || durationSeconds <= 0}
      onValueChange={seekThrottled}
      onValueCommit={(value) => {
        pendingRef.current = null;
        setTarget(value);
        seek(value);
      }}
      className={cn(
        "group/slider relative flex flex-1 cursor-pointer items-center justify-center outline-hidden",
        "data-disabled:pointer-events-none",
        "transition-[--media-slider-fill] duration-media-slider ease-out data-dragging:duration-0",
        "rounded-media-pill",
        "data-[orientation=horizontal]:h-(--media-slider-height,--spacing(8))",
        "data-[orientation=horizontal]:min-w-18",
      )}
    >
      {/* Same markup as the Video.js chapters, one segment per chapter, with
          the segment under the pointer thickened on hover. */}
      <div className="relative flex size-full min-h-0 min-w-0 flex-1 items-center rounded-[inherit]">
        {segments.map((segment) => (
          <div
            key={segment.key}
            className={cn(
              "group/chapter absolute inset-0 flex min-h-0 min-w-0 items-center justify-center",
              "[--media-chapter-inset-start:0.5] [--media-chapter-inset-end:0.5]",
              "first-of-type:[--media-chapter-inset-start:0] last-of-type:[--media-chapter-inset-end:0]",
              "clip-media-chapter-x",
            )}
            style={
              {
                "--media-slider-chapter-start": `${segment.startPercent}%`,
                "--media-slider-chapter-end": `${segment.endPercent}%`,
              } as CSSProperties
            }
            data-orientation="horizontal"
          >
            <SliderTrack
              data-orientation="horizontal"
              className={cn(
                "transition-[height,width] duration-media-slow ease-out",
                "before:clip-media-chapter-track-x",
                "group-hover/chapter:h-1.75",
              )}
            >
              <SliderFill
                data-orientation="horizontal"
                className="group-hover/chapter:before:min-w-1.75"
              />
            </SliderTrack>
          </div>
        ))}
      </div>
      <SliderPrimitive.Thumb
        render={<SliderThumb />}
        className={cn(
          "opacity-0 data-interactive:opacity-100 focus-visible:opacity-100",
          "pointer-fine:group-hover/slider:scale-100 pointer-fine:group-hover/slider:opacity-100",
          "scale-80",
        )}
      />
      <SliderPrimitive.Preview
        overflow="clamp"
        className={cn(
          "group/preview relative h-1",
          "before:pointer-events-none before:absolute before:z-1 before:-translate-1/2 before:scale-50 before:opacity-0",
          "before:transition-[opacity,scale] before:duration-media-slow before:ease-out",
          "data-pointing:not-data-dragging:before:scale-100 data-pointing:not-data-dragging:before:opacity-100",
          "before:top-1/2 before:left-1/2 before:size-1 before:rounded-media-control before:bg-current",
          "min-w-(--media-slider-preview-max-width) [--media-slider-preview-max-width:min(--spacing(32),100cqi)]",
          "@min-[30rem]/media-root:[--media-slider-preview-max-width:min(--spacing(40),100cqi)]",
          "media-2xl:[--media-slider-preview-max-width:min(--spacing(48),100cqi)]",
        )}
      >
        {preview}
        <SliderPrimitive.Value
          type="pointer"
          format={formatPointer}
          className={cn(
            "absolute left-1/2 w-max -translate-x-1/2 translate-y-media-hidden-preview-offset scale-media-hidden-preview opacity-0",
            "origin-bottom blur-media-hidden text-center whitespace-pre-line tabular-nums",
            "transition-[filter,opacity,scale] duration-media-base ease-out",
            "group-data-pointing/preview:scale-100 group-data-pointing/preview:opacity-100 group-data-pointing/preview:filter-none",
            "group-has-focus-visible/slider:scale-100 group-has-focus-visible/slider:opacity-100 group-has-focus-visible/slider:filter-none",
            "bottom-[calc(100%+var(--media-slider-preview-label-offset))]",
          )}
        />
      </SliderPrimitive.Preview>
    </SliderPrimitive.Root>
  );
}

// Chapters mapped onto the edited timeline, with uncovered stretches filled
// in as untitled segments so the bar is continuous.
function editedSegments(
  cues: readonly ChapterCue[],
  cuts: readonly RecordingCut[],
  durationSeconds: number,
): Segment[] {
  const totalMs = durationSeconds * 1000;
  if (totalMs <= 0) return [];
  const percent = (sourceMs: number): number =>
    Math.min(100, (toEditedMs(sourceMs, cuts) / totalMs) * 100);
  const out: Segment[] = [];
  let cursor = 0;
  const push = (end: number, key: string, title: string | null): void => {
    if (end - cursor > 0) {
      out.push({ key, startPercent: cursor, endPercent: end, title });
      cursor = end;
    }
  };
  for (const cue of cues) {
    const start = percent(cue.startMs);
    push(start, `gap-${cue.id}`, null);
    push(percent(cue.endMs), cue.id, cue.title);
  }
  push(100, "gap-end", null);
  return out;
}
