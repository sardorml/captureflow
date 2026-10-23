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
import { isInsideCut, type RecordingCut } from "@/lib/recording/cuts";
import { cn } from "@/lib/utils";

type Props = {
  playerRef: RefObject<RecordingPlayerHandle | null>;
  durationMs: number | null;
  cuts: RecordingCut[];
  // The span about to be cut, shared with the transcript panel: lines picked
  // there or a segment picked here, whichever was chosen last.
  selection?: RecordingCut | null;
  onSelectSpan?: (span: RecordingCut | null) => void;
  onDeleteSelection?: () => void;
};

const WAVEFORM_BARS = 160;
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const ZOOM_STEP = 1;
// Two splits closer than this collapse into one.
const SPLIT_MERGE_MS = 50;
// A press that travels further than this is a scrub, not a segment pick.
const PICK_SLOP_PX = 3;

export function EditorTimeline({
  playerRef,
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

  // The player owns the <video> and exposes only an imperative handle, so
  // mirror its playhead each frame rather than lifting currentTime into React.
  // Skipped while the track is collapsed — nothing visible to update.
  useEffect(() => {
    if (!showWaveform) return;
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
  }, [playerRef, showWaveform]);

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

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>): void => {
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
      if (!moved && ev.type === "pointerup")
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
  const bars = useMemo(
    () =>
      Array.from({ length: WAVEFORM_BARS }, (_, i) => {
        const v = Math.abs(Math.sin(i * 0.7) * 0.6 + Math.sin(i * 0.23) * 0.4);
        return 0.18 + v * 0.82;
      }),
    [],
  );

  const totalMs = duration * 1000;
  const pct = (ms: number): string => `${(ms / totalMs) * 100}%`;
  const splitLabel = `Split at ${formatTime(fraction * duration)}`;

  return (
    <div className="shrink-0 bg-canvas-2">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex items-center gap-1">
          <ToolButton
            icon={<AudioLines className="h-4 w-4" />}
            label={showWaveform ? "Hide waveform" : "Show waveform"}
            onClick={() => setShowWaveform((v) => !v)}
          />
          <span className="mx-1 h-5 w-px bg-line" aria-hidden />
          <ToolButton
            icon={<Scissors className="h-4 w-4" />}
            label={splitLabel}
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

      {showWaveform ? (
        <div ref={scrollRef} className="overflow-x-auto px-3 pb-3">
          <div style={{ width: `${zoom * 100}%` }}>
            <div className="relative mb-1 h-4 text-[10px] tabular-nums text-fg-subtle">
              {ticks.map((tick) => (
                <span
                  key={tick.t}
                  className="absolute -translate-x-1/2"
                  style={{ left: `${tick.leftPct}%` }}
                >
                  {tick.label}
                </span>
              ))}
            </div>
            <div
              ref={trackRef}
              onPointerDown={onPointerDown}
              onKeyDown={onKeyDown}
              role="slider"
              tabIndex={0}
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(fraction * duration)}
              aria-valuetext={formatTime(fraction * duration)}
              className="relative h-16 cursor-pointer touch-none overflow-hidden rounded-2xl bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center gap-px px-1"
              >
                {bars.map((h, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-full bg-fg-subtle/40"
                    style={{ height: `${h * 70}%` }}
                  />
                ))}
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
                      <span className="absolute left-1/2 top-0 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full bg-accent text-white group-hover/split:bg-danger">
                        <Scissors className="h-2.5 w-2.5" />
                      </span>
                    </button>
                  ))
                : null}

              {/* Full-clip selection region (trim handles are placeholders). */}
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-y-1 left-0 right-0 rounded-xl border-2 border-accent/70",
                  splits.length > 0 && "hidden",
                )}
              >
                <span className="absolute -left-px top-1/2 h-6 w-1.5 -translate-y-1/2 rounded-full bg-accent" />
                <span className="absolute -right-px top-1/2 h-6 w-1.5 -translate-y-1/2 rounded-full bg-accent" />
              </div>

              {/* Live playhead, mirrored from the player. */}
              <div
                className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-fg"
                style={{ left: `${fraction * 100}%` }}
              >
                <span className="absolute -top-0.5 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-fg" />
              </div>
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
      className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-fg-muted transition-colors hover:bg-tint hover:text-fg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-fg-muted"
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
  const step = niceStep(duration / (6 * zoom));
  const ticks: Tick[] = [];
  for (let t = step; t < duration; t += step) {
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
