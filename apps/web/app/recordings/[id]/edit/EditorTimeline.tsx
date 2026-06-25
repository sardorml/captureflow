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
import { Tooltip } from "antd";
import type { RecordingPlayerHandle } from "@/app/_components/recording";

type Props = {
  playerRef: RefObject<RecordingPlayerHandle | null>;
  durationMs: number | null;
};

const WAVEFORM_BARS = 160;

export function EditorTimeline({ playerRef, durationMs }: Props) {
  const [showWaveform, setShowWaveform] = useState(true);
  const [fraction, setFraction] = useState(0);
  const [duration, setDuration] = useState((durationMs ?? 0) / 1000);
  const durationRef = useRef(duration);
  const trackRef = useRef<HTMLDivElement | null>(null);

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

  const seekFromClientX = (clientX: number): void => {
    const el = trackRef.current;
    const p = playerRef.current;
    if (!el || !p) return;
    const rect = el.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    if (durationRef.current > 0) p.seek(f * durationRef.current);
    setFraction(f);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>): void => {
    e.preventDefault();
    seekFromClientX(e.clientX);
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent): void => seekFromClientX(ev.clientX);
    const up = (): void => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
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

  const ticks = useMemo(() => buildTicks(duration), [duration]);
  const bars = useMemo(
    () =>
      Array.from({ length: WAVEFORM_BARS }, (_, i) => {
        const v = Math.abs(Math.sin(i * 0.7) * 0.6 + Math.sin(i * 0.23) * 0.4);
        return 0.18 + v * 0.82;
      }),
    [],
  );

  const splitLabel = `Split at ${formatTime(fraction * duration)}`;

  return (
    <div className="shrink-0 border-t border-line bg-canvas-2">
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
            disabled
          />
          <ToolButton
            icon={<Trash2 className="h-4 w-4" />}
            label="Delete selection"
            disabled
          />
        </div>
        <Tooltip title="Zoom (coming soon)">
          <div className="flex items-center gap-2 text-xs text-fg-muted opacity-60">
            <span>Fit</span>
            <ZoomOut className="h-4 w-4" />
            <input
              type="range"
              min={0}
              max={100}
              defaultValue={50}
              disabled
              aria-label="Timeline zoom (coming soon)"
              className="h-1 w-28 cursor-not-allowed accent-accent"
            />
            <ZoomIn className="h-4 w-4" />
          </div>
        </Tooltip>
      </div>

      {showWaveform ? (
        <div className="px-3 pb-3">
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
            className="relative h-16 cursor-pointer touch-none overflow-hidden rounded-md border border-line bg-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring"
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

            {/* Full-clip selection region (trim handles are placeholders). */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-1 left-0 right-0 rounded-md border-2 border-accent/70"
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
      ) : null}
    </div>
  );
}

function ToolButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-fg-muted transition-colors hover:bg-overlay hover:text-fg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-fg-muted"
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
  return disabled ? <Tooltip title="Coming soon">{button}</Tooltip> : button;
}

type Tick = { t: number; label: string; leftPct: number };

function buildTicks(duration: number): Tick[] {
  if (!Number.isFinite(duration) || duration <= 0) return [];
  const step = niceStep(duration / 6);
  const ticks: Tick[] = [];
  for (let t = step; t < duration; t += step) {
    ticks.push({ t, label: formatTime(t), leftPct: (t / duration) * 100 });
  }
  return ticks;
}

function niceStep(raw: number): number {
  const candidates = [5, 10, 15, 30, 60, 120, 300, 600];
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
