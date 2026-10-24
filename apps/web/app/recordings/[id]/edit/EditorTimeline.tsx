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
import { Tooltip } from "@heroui/react";
import type { RecordingPlayerHandle } from "@/app/_components/recording";
import { useFrameStrip } from "@/app/_components/recording/use-frame-strip";
import { isInsideCut, type RecordingCut } from "@/lib/recording/cuts";
import { cn } from "@/lib/utils";
import { EditorFilmstrip } from "./EditorFilmstrip";
import { EditorWaveform } from "./EditorWaveform";
import { useWaveform } from "./use-waveform";

type Props = {
  playerRef: RefObject<RecordingPlayerHandle | null>;
  videoUrl: string;
  durationMs: number | null;
  cuts: RecordingCut[];
  // The span about to be cut, shared with the transcript panel: lines picked
  // there or a segment picked here, whichever was chosen last.
  selection?: RecordingCut | null;
  onSelectSpan?: (span: RecordingCut | null) => void;
  onDeleteSelection?: () => void;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const ZOOM_STEP = 1;
// Two splits closer than this collapse into one.
const SPLIT_MERGE_MS = 50;
// A press that travels further than this is a scrub, not a segment pick.
const PICK_SLOP_PX = 3;

export function EditorTimeline({
  playerRef,
  videoUrl,
  durationMs,
  cuts,
  selection,
  onSelectSpan,
  onDeleteSelection,
}: Props) {
  const [showWaveform, setShowWaveform] = useState(true);
  const [fraction, setFraction] = useState(0);
  const [duration, setDuration] = useState((durationMs ?? 0) / 1000);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [splits, setSplits] = useState<number[]>([]);
  const durationRef = useRef(duration);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const frames = useFrameStrip(videoUrl);
  const waveform = useWaveform(videoUrl, durationMs);

  // The player owns the <video> and exposes only an imperative handle, so
  // mirror its playhead each frame rather than lifting currentTime into React.
  useEffect(() => {
    let raf = 0;
    const tick = (): void => {
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

  const segments = useMemo((): RecordingCut[] => {
    if (duration <= 0 || splits.length === 0) return [];
    const edges = [0, ...splits.map((s) => s * 1000), duration * 1000];
    const out: RecordingCut[] = [];
    for (let i = 0; i < edges.length - 1; i++) {
      out.push({ startMs: edges[i]!, endMs: edges[i + 1]! });
    }
    return out;
  }, [duration, splits]);

  const pickSegment = (f: number): void => {
    if (!onSelectSpan || segments.length === 0) return;
    const ms = f * duration * 1000;
    const hit = segments.find((s) => ms >= s.startMs && ms < s.endMs);
    if (!hit || isInsideCut(ms, cuts)) return;
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
    <div className="flex h-52 shrink-0 flex-col border-t border-line bg-panel">
      <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-line px-3">
        <div className="flex items-center gap-1">
          <span className="mr-2 font-mono text-xs text-fg tabular-nums">
            {formatTime(current)}
            <span className="text-fg-subtle"> / {formatTime(duration)}</span>
          </span>
          <ToolButton
            icon={<Scissors className="h-4 w-4" />}
            label="Split"
            onClick={splitAtPlayhead}
            disabled={duration <= 0}
            hint="Play or scrub to a moment first"
          />
          <ToolButton
            icon={<Trash2 className="h-4 w-4" />}
            label="Delete selection"
            onClick={onDeleteSelection}
            disabled={!onDeleteSelection}
            hint="Select lines in the transcript, or split the timeline and pick a segment"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-fg-muted">
          <ToolButton
            icon={<AudioLines className="h-4 w-4" />}
            label={showWaveform ? "Hide audio" : "Show audio"}
            onClick={() => setShowWaveform((v) => !v)}
          />
          <span className="h-5 w-px bg-line" aria-hidden />
          <button
            type="button"
            onClick={() => setZoomClamped(MIN_ZOOM)}
            disabled={zoom === MIN_ZOOM}
            className="rounded-md px-1.5 py-0.5 transition-colors hover:bg-tint hover:text-fg disabled:opacity-60 disabled:hover:bg-transparent"
          >
            Fit
          </button>
          <button
            type="button"
            onClick={() => setZoomClamped(zoom - ZOOM_STEP)}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
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
            aria-label="Timeline zoom"
            className="h-1 w-28 cursor-pointer accent-accent"
          />
          <button
            type="button"
            onClick={() => setZoomClamped(zoom + ZOOM_STEP)}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
            className="rounded-md p-0.5 transition-colors hover:bg-tint hover:text-fg disabled:opacity-60 disabled:hover:bg-transparent"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden px-4 pb-3"
      >
        <div className="relative h-full" style={{ width: `${zoom * 100}%` }}>
          <div
            onPointerDown={scrubFrom(false)}
            className="relative h-6 cursor-pointer touch-none border-b border-line text-[10px] text-fg-subtle tabular-nums select-none"
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
            onKeyDown={onKeyDown}
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(current)}
            aria-valuetext={formatTime(current)}
            className="relative mt-2.5 cursor-pointer touch-none rounded-lg select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring"
          >
            <div className="relative h-20 overflow-hidden rounded-lg bg-tint-strong ring-1 ring-line">
              <EditorFilmstrip strip={frames} />
              {showWaveform ? (
                <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/60 via-black/35 to-transparent">
                  <EditorWaveform buckets={waveform} />
                </div>
              ) : null}
            </div>

            {/* Cut spans the player skips, from the transcript panel. */}
            {duration > 0
              ? cuts.map((cut) => (
                  <div
                    key={cut.startMs}
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 border-x border-danger/60 bg-[repeating-linear-gradient(135deg,var(--danger)_0_2px,transparent_2px_6px)] opacity-40"
                    style={{
                      left: pct(cut.startMs),
                      width: pct(cut.endMs - cut.startMs),
                    }}
                  />
                ))
              : null}

            {selection && duration > 0 ? (
              <div
                aria-hidden
                data-timeline-selection
                className="pointer-events-none absolute inset-y-0 rounded-md border-x-2 border-danger bg-danger/25"
                style={{
                  left: pct(selection.startMs),
                  width: pct(selection.endMs - selection.startMs),
                }}
              />
            ) : null}

            {/* Split points; click one to remove it. */}
            {duration > 0
              ? splits.map((s) => (
                  <button
                    key={s}
                    type="button"
                    title={`Remove split at ${formatTime(s)}`}
                    aria-label={`Remove split at ${formatTime(s)}`}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => removeSplit(s)}
                    className="group/split absolute inset-y-0 w-3 -translate-x-1/2"
                    style={{ left: pct(s * 1000) }}
                  >
                    <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-accent group-hover/split:bg-danger" />
                    <span className="absolute top-0 left-1/2 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full bg-accent text-white group-hover/split:bg-danger">
                      <Scissors className="h-2.5 w-2.5" />
                    </span>
                  </button>
                ))
              : null}
          </div>

          {/* Live playhead, mirrored from the player, from the ruler down. */}
          <div
            className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-fg"
            style={{ left: `${fraction * 100}%` }}
          >
            <span className="absolute top-0 left-1/2 h-3 w-2.5 -translate-x-1/2 rounded-b-sm bg-fg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolButton({
  icon,
  label,
  onClick,
  disabled,
  hint = "Coming soon",
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  hint?: string;
}) {
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
      <Tooltip.Trigger className="inline-flex" tabIndex={0}>
        {button}
      </Tooltip.Trigger>
      <Tooltip.Content>{hint}</Tooltip.Content>
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
