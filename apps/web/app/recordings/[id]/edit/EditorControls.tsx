"use client";

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react";
import {
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { formatBytes, formatDuration } from "@/lib/format";
import {
  clampWebcamPoint,
  webcamCornerPoint,
  webcamSizeFraction,
} from "@/app/_components/recording/layout";
import {
  RECORDING_GRADIENT_KEYS,
  RECORDING_GRADIENT_PRESETS,
  isRecordingHexColor,
  recordingGradientCss,
  type RecordingCameraCorner,
  type RecordingCameraPoint,
  type RecordingCameraSize,
} from "@/lib/recording-config";

const SOLID_PALETTE = [
  "#2563eb",
  "#0ea5e9",
  "#65a30d",
  "#ca8a04",
  "#db2777",
  "#dc2626",
  "#ea580c",
  "#64748b",
  "#0f172a",
  "#7c3aed",
  "#0d9488",
  "#be123c",
  "#525252",
  "#e5e7eb",
  "#ffffff",
];

const CAMERA_CORNERS: { value: RecordingCameraCorner; label: string }[] = [
  { value: "top-left", label: "Top left" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-right", label: "Bottom right" },
];

const CAMERA_SIZES: { value: RecordingCameraSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

export function BackgroundPicker({
  background,
  onChange,
}: {
  background: string;
  onChange: (bg: string) => void;
}) {
  const isSolid = (hex: string): boolean =>
    background.toLowerCase() === hex.toLowerCase();
  return (
    <div className="flex flex-col gap-3">
      <SwatchGroup label="Gradients">
        <Swatch
          selected={background === "transparent"}
          onClick={() => onChange("transparent")}
          label="No background"
          className="bg-tint text-[9px] font-medium text-fg-muted"
        >
          None
        </Swatch>
        {RECORDING_GRADIENT_KEYS.map((k) => (
          <Swatch
            key={k}
            selected={background === k}
            onClick={() => onChange(k)}
            label={RECORDING_GRADIENT_PRESETS[k].label}
            style={{
              background: recordingGradientCss(
                RECORDING_GRADIENT_PRESETS[k].stops,
              ),
            }}
          />
        ))}
      </SwatchGroup>
      <SwatchGroup label="Solid">
        {SOLID_PALETTE.map((hex) => (
          <Swatch
            key={hex}
            selected={isSolid(hex)}
            onClick={() => onChange(hex)}
            label={`Solid ${hex}`}
            style={{ backgroundColor: hex }}
          />
        ))}
        <label
          className={cn(
            SWATCH_CLASS,
            "cursor-pointer",
            isRecordingHexColor(background) &&
              !SOLID_PALETTE.some(isSolid) &&
              SWATCH_SELECTED_CLASS,
          )}
          style={{
            background:
              "conic-gradient(from 0deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #ec4899, #ef4444)",
          }}
          aria-label="Pick a custom color"
        >
          <input
            type="color"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            value={isRecordingHexColor(background) ? background : "#000000"}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      </SwatchGroup>
    </div>
  );
}

const SWATCH_CLASS =
  "relative flex aspect-square items-center justify-center rounded-md ring-1 ring-line transition-shadow hover:ring-line-strong";
const SWATCH_SELECTED_CLASS =
  "ring-2 ring-accent ring-offset-2 ring-offset-panel hover:ring-accent";

function SwatchGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] text-fg-subtle">{label}</div>
      <div className="grid grid-cols-8 gap-1.5">{children}</div>
    </div>
  );
}

function Swatch({
  selected,
  onClick,
  label,
  className,
  style,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={label}
      title={label}
      className={cn(SWATCH_CLASS, selected && SWATCH_SELECTED_CLASS, className)}
      style={style}
    >
      {children}
    </button>
  );
}

export function CameraPicker({
  corner,
  point,
  size,
  hidden,
  aspect,
  onCorner,
  onPoint,
  onSize,
  onHidden,
}: {
  corner: RecordingCameraCorner;
  // A dragged place of its own; while set, no corner is current.
  point: RecordingCameraPoint | null;
  size: RecordingCameraSize;
  hidden: boolean;
  aspect: number;
  onCorner: (c: RecordingCameraCorner) => void;
  onPoint: (p: RecordingCameraPoint) => void;
  onSize: (s: RecordingCameraSize) => void;
  onHidden: (hidden: boolean) => void;
}) {
  const free = point !== null;
  return (
    <div>
      <div className="mb-3">
        <ToggleRow
          label="Show camera"
          on={!hidden}
          onChange={(on) => onHidden(!on)}
          OnIcon={Video}
          OffIcon={VideoOff}
          offText="Hidden"
        />
      </div>
      <div className="mb-1 text-[10px] uppercase tracking-wide text-fg-muted">
        Position
      </div>
      <div className="grid grid-cols-2 gap-2">
        {CAMERA_CORNERS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onCorner(opt.value)}
            aria-pressed={!free && corner === opt.value}
            className={cn(
              "rounded-xl border px-3 py-2 text-xs transition-colors",
              !free && corner === opt.value
                ? "border-accent bg-accent-soft text-accent"
                : "border-transparent bg-tint text-fg-muted hover:bg-tint-strong",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="mt-2 mb-1 text-[10px] uppercase tracking-wide text-fg-muted">
        Anywhere
      </div>
      <CameraPad
        corner={corner}
        point={point}
        size={size}
        aspect={aspect}
        disabled={hidden}
        onPoint={onPoint}
      />
      <p className="mt-1.5 text-[11px] leading-snug text-fg-muted">
        {hidden
          ? "Show the camera to place it."
          : "Drag the dot to put the camera anywhere on the video."}
      </p>
      <div className="mt-3 mb-1 text-[10px] uppercase tracking-wide text-fg-muted">
        Size
      </div>
      <div className="grid grid-cols-3 gap-2">
        {CAMERA_SIZES.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSize(opt.value)}
            aria-pressed={size === opt.value}
            className={cn(
              "rounded-xl border px-3 py-2 text-xs transition-colors",
              size === opt.value
                ? "border-accent bg-accent-soft text-accent"
                : "border-transparent bg-tint text-fg-muted hover:bg-tint-strong",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AudioControls({
  micMuted,
  systemMuted,
  hasMic,
  onMic,
  onSystem,
}: {
  micMuted: boolean;
  systemMuted: boolean;
  hasMic: boolean;
  onMic: (muted: boolean) => void;
  onSystem: (muted: boolean) => void;
}) {
  // The microphone is its own track only next to a camera; otherwise it is
  // mixed with the system sound and the one toggle covers both.
  return (
    <div>
      <ToggleRow
        label={hasMic ? "System sound" : "Sound"}
        on={!systemMuted}
        onChange={(on) => onSystem(!on)}
        OnIcon={Volume2}
        OffIcon={VolumeX}
        offText="Muted"
      />
      {hasMic ? (
        <div className="mt-1.5">
          <ToggleRow
            label="Microphone"
            on={!micMuted}
            onChange={(on) => onMic(!on)}
            OnIcon={Mic}
            OffIcon={MicOff}
            offText="Muted"
          />
        </div>
      ) : (
        <p className="mt-1.5 text-[11px] text-fg-muted">
          Microphone and system sound share one track on this recording.
        </p>
      )}
    </div>
  );
}

/*
 * A picture of the video box with the bubble as a dot: pressing anywhere
 * moves the dot there, dragging follows the pointer, and the place is
 * reported on release as fractions of the box. The dot is the bubble's size
 * relative to the box, so what fits here fits there.
 */
function CameraPad({
  corner,
  point,
  size,
  aspect,
  disabled,
  onPoint,
}: {
  corner: RecordingCameraCorner;
  point: RecordingCameraPoint | null;
  size: RecordingCameraSize;
  aspect: number;
  disabled: boolean;
  onPoint: (p: RecordingCameraPoint) => void;
}) {
  const [dragPoint, setDragPoint] = useState<RecordingCameraPoint | null>(null);
  const fraction = webcamSizeFraction(size);
  const half = { x: fraction / 2, y: (fraction / 2) * aspect };
  const shown = dragPoint ?? point ?? webcamCornerPoint(corner, half);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>): void => {
    if (disabled || e.button !== 0) return;
    e.preventDefault();
    const pad = e.currentTarget;
    const box = pad.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return;
    const at = (ev: { clientX: number; clientY: number }) =>
      clampWebcamPoint(
        {
          x: (ev.clientX - box.left) / box.width,
          y: (ev.clientY - box.top) / box.height,
        },
        half,
      );
    setDragPoint(at(e));
    const move = (ev: PointerEvent): void => setDragPoint(at(ev));
    const end = (ev: PointerEvent): void => {
      pad.removeEventListener("pointermove", move);
      pad.removeEventListener("pointerup", end);
      pad.removeEventListener("pointercancel", end);
      setDragPoint(null);
      if (ev.type === "pointerup") onPoint(at(ev));
    };
    pad.setPointerCapture(e.pointerId);
    pad.addEventListener("pointermove", move);
    pad.addEventListener("pointerup", end);
    pad.addEventListener("pointercancel", end);
  };

  return (
    <div
      data-camera-pad
      onPointerDown={onPointerDown}
      className={cn(
        "relative w-full touch-none overflow-hidden rounded-xl border border-line bg-tint",
        disabled ? "opacity-50" : "cursor-crosshair",
      )}
      style={{ aspectRatio: String(aspect) }}
    >
      <div
        className={cn(
          "absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent shadow-sm",
          !disabled && "cursor-grab active:cursor-grabbing",
        )}
        style={{
          width: `${fraction * 100}%`,
          left: `${shown.x * 100}%`,
          top: `${shown.y * 100}%`,
        }}
      />
    </div>
  );
}

function ToggleRow({
  label,
  on,
  onChange,
  OnIcon,
  OffIcon,
  offText,
}: {
  label: string;
  on: boolean;
  onChange: (on: boolean) => void;
  OnIcon: LucideIcon;
  OffIcon: LucideIcon;
  offText: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between rounded-full bg-field px-4 py-1.5 text-sm text-fg hover:bg-tint-strong"
    >
      <span>{label}</span>
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs",
          on ? "text-accent" : "text-fg-muted",
        )}
      >
        {on ? (
          <OnIcon className="h-3.5 w-3.5" />
        ) : (
          <OffIcon className="h-3.5 w-3.5" />
        )}
        {on ? "On" : offText}
      </span>
    </button>
  );
}

export type RecordingDetails = {
  slug: string;
  sizeBytes: number;
  durationMs: number | null;
  viewCount: number;
  createdAt: number;
};

export function DetailsList({
  slug,
  sizeBytes,
  durationMs,
  viewCount,
  createdAt,
}: RecordingDetails) {
  return (
    <dl className="space-y-1 text-xs text-fg-muted">
      <Row label="Link" value={`/${slug}`} mono />
      <Row label="Size" value={formatBytes(sizeBytes)} />
      {durationMs != null ? (
        <Row label="Duration" value={formatDuration(durationMs)} />
      ) : null}
      <Row label="Views" value={String(viewCount)} />
      <Row label="Created" value={formatDate(createdAt)} />
    </dl>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt>{label}</dt>
      <dd className={cn("truncate text-fg", mono && "font-mono")}>{value}</dd>
    </div>
  );
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
