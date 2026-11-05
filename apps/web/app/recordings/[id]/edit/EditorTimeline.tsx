"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { AudioLines, Scissors, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { useAppMessages } from "@/components/app-i18n-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { RecordingPlayerHandle } from "@/app/_components/recording";
import {
  cutsEqual,
  isCutHop,
  timelineClips,
  trimClip,
  type RecordingCut,
} from "@/lib/recording/cuts";
import { fmt } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";
import { EditorWaveform } from "./EditorWaveform";
import { useWaveform } from "./use-waveform";

type Props = {
  playerRef: RefObject<RecordingPlayerHandle | null>;
  slug: string;
  hasWebcam: boolean;
  durationMs: number | null;
  sizeBytes: number;
  cuts: RecordingCut[];
  selection?: RecordingCut | null;
  onSelectSpan?: (span: RecordingCut | null) => void;
  onDeleteSelection?: () => void;
  onCutsChange?: (cuts: RecordingCut[]) => void;
  onTrimPreview?: (preview: TrimPreview | null) => void;
  onHoverMs?: (ms: number | null) => void;
};

export type TrimPreview = { cuts: RecordingCut[]; edgeMs: number };
type Edge = "start" | "end";

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const ZOOM_STEP = 1;
// Two splits closer than this collapse into one.
const SPLIT_MERGE_MS = 50;
// A press that travels further than this is a scrub, not a segment pick.
const PICK_SLOP_PX = 3;
const TRIM_KEY_STEP_MS = 250;
const PLAYHEAD_GLIDE_MS = 180;

export function EditorTimeline({
  playerRef,
  slug,
  hasWebcam,
  durationMs,
  sizeBytes,
  cuts,
  selection,
  onSelectSpan,
  onDeleteSelection,
  onCutsChange,
  onTrimPreview,
  onHoverMs,
}: Props) {
  const t = useAppMessages().recordingEditor.timeline;
  const [showWaveform, setShowWaveform] = useState(true);
  const [fraction, setFraction] = useState(0);
  // Where the playhead is drawn while it slides over a cut playback hopped;
  // `fraction` is already past it.
  const [glidingAt, setGlidingAt] = useState<number | null>(null);
  const cutsRef = useRef(cuts);
  cutsRef.current = cuts;
  const [duration, setDuration] = useState((durationMs ?? 0) / 1000);
  // Flips once the player has the file's metadata, which is when the waveform
  // starts pulling at the file, so the player already has its head start.
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [splits, setSplits] = useState<number[]>([]);
  const [trimmedCuts, setTrimmedCuts] = useState<RecordingCut[] | null>(null);
  const shownCuts = trimmedCuts ?? cuts;
  const endTrimRef = useRef<(() => void) | null>(null);
  const durationRef = useRef(duration);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // The camera file carries the mic, so the audio lane reads it too.
  const audioTracks = useMemo(() => {
    const base = `/api/r/waveform/${slug}`;
    const screen = { peaksUrl: base, audioUrl: `${base}/audio` };
    if (!hasWebcam) return [screen];
    const query = "?track=webcam";
    return [
      screen,
      { peaksUrl: base + query, audioUrl: `${base}/audio${query}` },
    ];
  }, [slug, hasWebcam]);
  const waveform = useWaveform(audioTracks, durationMs, sizeBytes);

  // The player owns the <video> and exposes only an imperative handle, so
  // mirror its playhead each frame rather than lifting currentTime into React.
  useEffect(() => {
    let raf = 0;
    let lastF = 0;
    let glide: { from: number; startedAt: number } | null = null;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const tick = (now: number): void => {
      const p = playerRef.current;
      if (p) {
        const d = p.getDuration();
        if (d > 0 && Math.abs(durationRef.current - d) > 0.01) {
          durationRef.current = d;
          setDuration(d);
        }
        const denom = durationRef.current;
        const f =
          denom > 0 ? Math.max(0, Math.min(1, p.getCurrentTime() / denom)) : 0;
        setFraction((prev) => (Math.abs(prev - f) > 0.0005 ? f : prev));
        const fromMs = lastF * denom * 1000;
        if (
          !reducedMotion &&
          p.isPlaying() &&
          isCutHop(fromMs, f * denom * 1000, cutsRef.current)
        ) {
          glide = { from: lastF, startedAt: now };
        }
        lastF = f;
        if (glide) {
          const t = (now - glide.startedAt) / PLAYHEAD_GLIDE_MS;
          if (t >= 1) {
            glide = null;
            setGlidingAt(null);
          } else {
            setGlidingAt(glide.from + (f - glide.from) * (1 - (1 - t) ** 2));
          }
        }
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [playerRef]);

  // Zoomed in, keep the playhead on screen as it moves.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || zoom === MIN_ZOOM) return;
    const x = fraction * el.scrollWidth;
    if (x < el.scrollLeft || x > el.scrollLeft + el.clientWidth) {
      el.scrollLeft = Math.max(0, x - el.clientWidth / 2);
    }
  }, [fraction, zoom]);

  const seekFromClientX = (clientX: number): number => {
    const el = trackRef.current;
    const p = playerRef.current;
    if (!el || !p) return fraction;
    const rect = el.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    if (durationRef.current > 0) p.seek(f * durationRef.current);
    setFraction(f);
    return f;
  };

  const clips = useMemo(
    () =>
      timelineClips(
        Math.round(duration * 1000),
        shownCuts,
        splits.map((s) => Math.round(s * 1000)),
      ),
    [duration, shownCuts, splits],
  );

  // A split only means something where two clips still meet; one a trim has
  // pulled apart comes back if the clips are dragged together again.
  const joinedSplits = splits.filter((s) => {
    const ms = Math.round(s * 1000);
    return (
      clips.some((c) => c.endMs === ms) && clips.some((c) => c.startMs === ms)
    );
  });

  useEffect(() => () => endTrimRef.current?.(), []);

  const commitTrim = (next: RecordingCut[]): void => {
    if (cutsEqual(next, cuts)) return;
    onCutsChange?.(next);
    onSelectSpan?.(null);
  };

  const startTrim = (
    e: ReactPointerEvent<HTMLElement>,
    clip: RecordingCut,
    edge: Edge,
  ): void => {
    e.preventDefault();
    e.stopPropagation();
    const base = cuts;
    let next = base;
    const move = (ev: PointerEvent): void => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return;
      const edgeMs = ((ev.clientX - rect.left) / rect.width) * duration * 1000;
      next = trimClip(base, clip, edge, edgeMs);
      setTrimmedCuts(next);
      onTrimPreview?.({ cuts: next, edgeMs });
    };
    const finish = (): void => {
      endTrimRef.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", finish);
      setTrimmedCuts(null);
      onTrimPreview?.(null);
    };
    const up = (): void => {
      finish();
      commitTrim(next);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", finish);
    endTrimRef.current = finish;
  };

  const onTrimKey = (
    e: ReactKeyboardEvent<HTMLElement>,
    clip: RecordingCut,
    edge: Edge,
  ): void => {
    const step = { ArrowLeft: -TRIM_KEY_STEP_MS, ArrowRight: TRIM_KEY_STEP_MS }[
      e.key
    ];
    if (step === undefined) return;
    e.preventDefault();
    e.stopPropagation();
    const at = edge === "end" ? clip.endMs : clip.startMs;
    commitTrim(trimClip(cuts, clip, edge, at + step));
  };

  const pickSegment = (f: number): void => {
    // A lone clip stays unpicked, so the whole recording can't be deleted.
    if (!onSelectSpan || clips.length < 2) return;
    const ms = f * duration * 1000;
    const hit = clips.find((s) => ms >= s.startMs && ms < s.endMs);
    if (!hit) return;
    // A second click on the picked segment lets it go.
    const same =
      selection?.startMs === hit.startMs && selection.endMs === hit.endMs;
    onSelectSpan(same ? null : hit);
  };

  // Scrubs on the clip and the ruler alike; a still click on the clip also
  // picks the segment under it.
  const scrubFrom =
    (picks: boolean) =>
    (e: ReactPointerEvent<HTMLDivElement>): void => {
      e.preventDefault();
      const startX = e.clientX;
      let moved = false;
      seekFromClientX(e.clientX);
      const el = e.currentTarget;
      el.setPointerCapture(e.pointerId);
      const move = (ev: PointerEvent): void => {
        if (Math.abs(ev.clientX - startX) > PICK_SLOP_PX) moved = true;
        seekFromClientX(ev.clientX);
      };
      const up = (ev: PointerEvent): void => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        el.removeEventListener("pointercancel", up);
        if (picks && !moved && ev.type === "pointerup")
          pickSegment(seekFromClientX(ev.clientX));
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
    };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>): void => {
    const p = playerRef.current;
    const d = durationRef.current;
    if (!p || d <= 0) return;
    const cur = fraction * d;
    const step: Record<string, number> = {
      ArrowLeft: cur - 5,
      ArrowRight: cur + 5,
      PageDown: cur - 10,
      PageUp: cur + 10,
      Home: 0,
      End: d,
    };
    const next = step[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const clamped = Math.max(0, Math.min(d, next));
    p.seek(clamped);
    setFraction(clamped / d);
  };

  const splitAtPlayhead = (): void => {
    const at = fraction * duration;
    if (at <= 0 || at >= duration) return;
    setSplits((prev) => {
      if (prev.some((s) => Math.abs(s - at) * 1000 < SPLIT_MERGE_MS)) {
        return prev;
      }
      return [...prev, at].sort((a, b) => a - b);
    });
  };

  const removeSplit = (at: number): void => {
    setSplits((prev) => prev.filter((s) => s !== at));
    onSelectSpan?.(null);
  };

  const setZoomClamped = (next: number): void =>
    setZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, next)));

  const ticks = useMemo(() => buildTicks(duration, zoom), [duration, zoom]);

  const totalMs = duration * 1000;
  const pct = (ms: number): string => `${(ms / totalMs) * 100}%`;
  const current = fraction * duration;

  return (
    <div
      data-timeline
      className={cn(
        "flex shrink-0 flex-col border-t border-line bg-panel",
        showWaveform && "h-40",
      )}
    >
      <div
        className={cn(
          "flex h-11 shrink-0 items-center justify-between gap-2 px-3",
          showWaveform && "border-b border-line",
        )}
      >
        <div className="flex items-center gap-1">
          <ToolButton
            icon={<AudioLines className="h-4 w-4" />}
            label={showWaveform ? t.hideWaveform : t.showWaveform}
            onClick={() => {
              setShowWaveform((v) => !v);
              onHoverMs?.(null);
            }}
          />
          <ToolButton
            icon={<Trash2 className="h-4 w-4" />}
            label={t.deleteSelection}
            onClick={onDeleteSelection}
            disabled={!onDeleteSelection}
            hint={t.deleteSelectionHint}
          />
          <ToolButton
            icon={<Scissors className="h-4 w-4" />}
            label={fmt(t.splitAt, { time: formatTime(current) })}
            onClick={splitAtPlayhead}
            disabled={duration <= 0}
            hint={t.splitHint}
          />
        </div>
        <div
          className={cn(
            "flex items-center gap-2 text-xs text-fg-muted",
            !showWaveform && "hidden",
          )}
        >
          <button
            type="button"
            onClick={() => setZoomClamped(MIN_ZOOM)}
            disabled={zoom === MIN_ZOOM}
            className="rounded-md px-1.5 py-0.5 transition-colors hover:bg-tint hover:text-fg disabled:opacity-60 disabled:hover:bg-transparent"
          >
            {t.fit}
          </button>
          <button
            type="button"
            onClick={() => setZoomClamped(zoom - ZOOM_STEP)}
            disabled={zoom <= MIN_ZOOM}
            aria-label={t.zoomOut}
            className="rounded-md p-0.5 transition-colors hover:bg-tint hover:text-fg disabled:opacity-60 disabled:hover:bg-transparent"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.25}
            value={zoom}
            onChange={(e) => setZoomClamped(Number(e.target.value))}
            aria-label={t.zoom}
            className="h-1 w-28 cursor-pointer accent-accent"
          />
          <button
            type="button"
            onClick={() => setZoomClamped(zoom + ZOOM_STEP)}
            disabled={zoom >= MAX_ZOOM}
            aria-label={t.zoomIn}
            className="rounded-md p-0.5 transition-colors hover:bg-tint hover:text-fg disabled:opacity-60 disabled:hover:bg-transparent"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showWaveform ? (
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden px-4 pb-3"
        >
          <div className="relative h-full" style={{ width: `${zoom * 100}%` }}>
            <div
              onPointerDown={scrubFrom(false)}
              className="relative h-6 cursor-pointer touch-none text-[11px] text-fg-muted tabular-nums select-none"
            >
              {ticks.map((tick) => (
                <span
                  key={tick.t}
                  className={cn(
                    "absolute bottom-0 flex flex-col items-center",
                    tick.t > 0 && "-translate-x-1/2",
                  )}
                  style={{ left: `${tick.leftPct}%` }}
                >
                  <span>{tick.label}</span>
                  <span className="h-1.5 w-px bg-line-strong" />
                </span>
              ))}
            </div>

            <div
              ref={trackRef}
              onPointerDown={scrubFrom(true)}
              onPointerMove={(e) => {
                if (e.pointerType !== "mouse") return;
                const rect = e.currentTarget.getBoundingClientRect();
                const ms =
                  ((e.clientX - rect.left) / rect.width) * duration * 1000;
                const onClip = clips.some(
                  (c) => ms >= c.startMs && ms < c.endMs,
                );
                onHoverMs?.(onClip ? ms : null);
              }}
              onPointerLeave={() => onHoverMs?.(null)}
              onKeyDown={onKeyDown}
              role="slider"
              tabIndex={0}
              aria-label={t.seek}
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(current)}
              aria-valuetext={formatTime(current)}
              className="group/lane relative mt-1 cursor-pointer touch-none rounded-lg select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring"
            >
              <div data-timeline-lane className="relative h-14 bg-tint">
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-1/2 h-px bg-line-strong"
                />
                {clips.map((clip, i) => (
                  <div
                    key={i}
                    data-timeline-clip
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 overflow-hidden rounded-lg border-2 border-accent-bg bg-panel"
                    style={{
                      left: pct(clip.startMs),
                      width: `calc(${pct(clip.endMs - clip.startMs)} - 2px)`,
                    }}
                  >
                    <EditorWaveform
                      buckets={waveform}
                      from={clip.startMs / totalMs}
                      to={clip.endMs / totalMs}
                    />
                  </div>
                ))}
              </div>

              {selection &&
              clips.some(
                (c) =>
                  c.startMs === selection.startMs &&
                  c.endMs === selection.endMs,
              ) ? (
                <div
                  aria-hidden
                  data-timeline-selection
                  className="pointer-events-none absolute inset-y-0 rounded-lg border-2 border-accent-deep"
                  style={{
                    left: pct(selection.startMs),
                    width: `calc(${pct(selection.endMs - selection.startMs)} - 2px)`,
                  }}
                />
              ) : null}

              {onCutsChange
                ? clips.flatMap((clip, i) =>
                    (["start", "end"] as const).map((edge) => {
                      const edgeMs =
                        edge === "start" ? clip.startMs : clip.endMs;
                      const picked =
                        selection?.startMs === clip.startMs &&
                        selection.endMs === clip.endMs;
                      return (
                        <div
                          key={`${i}-${edge}`}
                          data-trim-handle={edge}
                          role="slider"
                          tabIndex={0}
                          aria-label={
                            edge === "start" ? t.trimStart : t.trimEnd
                          }
                          aria-valuemin={0}
                          aria-valuemax={Math.round(totalMs)}
                          aria-valuenow={edgeMs}
                          aria-valuetext={formatTime(edgeMs / 1000)}
                          onPointerDown={(e) => startTrim(e, clip, edge)}
                          onKeyDown={(e) => onTrimKey(e, clip, edge)}
                          className="group/trim absolute inset-y-0 z-10 w-3 cursor-ew-resize outline-none"
                          style={{
                            left:
                              edge === "start"
                                ? pct(edgeMs)
                                : `calc(${pct(edgeMs)} - 14px)`,
                          }}
                        >
                          <span
                            className={cn(
                              "absolute top-1/2 h-6 w-2 -translate-y-1/2 rounded-sm opacity-0 transition-opacity group-focus-visible/trim:opacity-100 group-hover/lane:opacity-100",
                              edge === "start" ? "-left-[3px]" : "-right-[3px]",
                              picked
                                ? "bg-accent-deep opacity-100"
                                : "bg-accent-bg group-hover/trim:bg-accent-deep",
                            )}
                          />
                        </div>
                      );
                    }),
                  )
                : null}

              {/* Split points; click one to remove it. */}
              {duration > 0
                ? joinedSplits.map((s) => (
                    <button
                      key={s}
                      type="button"
                      title={fmt(t.removeSplit, { time: formatTime(s) })}
                      aria-label={fmt(t.removeSplit, {
                        time: formatTime(s),
                      })}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => removeSplit(s)}
                      className="absolute -top-3 z-20 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full bg-accent-bg text-white opacity-0 transition-opacity group-hover/lane:opacity-100 hover:bg-destructive focus-visible:opacity-100"
                      style={{ left: pct(s * 1000) }}
                    >
                      <Scissors className="h-2.5 w-2.5" />
                    </button>
                  ))
                : null}
            </div>

            {/* Live playhead, mirrored from the player, from the ruler down. */}
            <div
              data-playhead
              className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-destructive"
              style={{ left: `${(glidingAt ?? fraction) * 100}%` }}
            >
              <span className="absolute top-0 left-1/2 h-3.5 w-3 -translate-x-1/2 bg-destructive [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ToolButton({
  icon,
  label,
  onClick,
  disabled,
  hint,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  hint?: string;
}) {
  const m = useAppMessages();
  const button = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-fg-muted transition-colors hover:bg-tint hover:text-fg",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-fg-muted",
      )}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
  if (!disabled) return button;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex" tabIndex={0}>
          {button}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {hint ?? m.recordingEditor.timeline.comingSoon}
      </TooltipContent>
    </Tooltip>
  );
}

type Tick = { t: number; label: string; leftPct: number };

function buildTicks(duration: number, zoom: number): Tick[] {
  if (!Number.isFinite(duration) || duration <= 0) return [];
  const step = niceStep(duration / (8 * zoom));
  const ticks: Tick[] = [];
  for (let t = 0; t < duration; t += step) {
    ticks.push({ t, label: formatTime(t), leftPct: (t / duration) * 100 });
  }
  return ticks;
}

function niceStep(raw: number): number {
  const candidates = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
  for (const c of candidates) if (raw <= c) return c;
  return 900;
}

function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const total = Math.floor(s);
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
