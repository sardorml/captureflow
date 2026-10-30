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
  webcamCornerNear,
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

// One row of each palette fits the inspector; the rest unfolds on request,
// or straight away when the saved background lives in a hidden row.
const SWATCHES_PER_ROW = 8;
const FIRST_GRADIENTS = RECORDING_GRADIENT_KEYS.slice(0, SWATCHES_PER_ROW - 1);
const FIRST_SOLIDS = SOLID_PALETTE.slice(0, SWATCHES_PER_ROW);

export function BackgroundPicker({
  background,
  onChange,
}: {
  background: string;
  onChange: (bg: string) => void;
}) {
  const isSolid = (hex: string): boolean =>
    background.toLowerCase() === hex.toLowerCase();
  const inFirstRows =
    background === "transparent" ||
    (FIRST_GRADIENTS as readonly string[]).includes(background) ||
    FIRST_SOLIDS.some(isSolid);
  const [expanded, setExpanded] = useState(!inFirstRows);
  const gradients = expanded ? RECORDING_GRADIENT_KEYS : FIRST_GRADIENTS;
  const solids = expanded ? SOLID_PALETTE : FIRST_SOLIDS;
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
        {gradients.map((k) => (
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
        {solids.map((hex) => (
          <Swatch
            key={hex}
            selected={isSolid(hex)}
            onClick={() => onChange(hex)}
            label={`Solid ${hex}`}
            style={{ backgroundColor: hex }}
          />
        ))}
        {expanded && (
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
        )}
      </SwatchGroup>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="self-start text-xs font-medium text-fg-muted hover:text-fg"
      >
        {expanded ? "Show less" : "See more"}
      </button>
    </div>
  );
}

const SWATCH_CLASS =
  "relative flex aspect-square items-center justify-center rounded-md ring-1 ring-line transition-shadow hover:ring-line-strong";
const SWATCH_SELECTED_CLASS =
  "ring-2 ring-primary ring-offset-2 ring-offset-panel hover:ring-primary";

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
  return (
    <div className="flex flex-col gap-3">
      <ToggleRow
        label="Show camera"
        on={!hidden}
        onChange={(on) => onHidden(!on)}
        OnIcon={Video}
        OffIcon={VideoOff}
        offText="Hidden"
      />
      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="text-sm text-fg">Position</span>
          <span className="text-[11px] text-fg-muted">
            {hidden
              ? "Show the camera to place it."
              : "Drag the dot or tap a corner"}
          </span>
        </div>
        <CameraPad
          corner={corner}
          point={point}
          size={size}
          aspect={aspect}
          disabled={hidden}
          onCorner={onCorner}
          onPoint={onPoint}
        />
      </div>
      <OptionRow
        label="Size"
        value={size}
        options={CAMERA_SIZES}
        onChange={onSize}
      />
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

// Below this many pixels of travel a press on a corner ring is a tap on it.
const TAP_SLOP_PX = 3;

/*
 * A picture of the video box: the dot is the bubble at its size relative to
 * the box, the dashed rings are where each corner would put it. Tapping a
 * ring picks that corner; pressing or dragging anywhere else moves the dot,
 * reported on release as fractions of the box, or as the corner it was let
 * go on. Pointer capture makes the click land on the pad, so the rings only
 * take keyboard clicks themselves.
 */
function CameraPad({
  corner,
  point,
  size,
  aspect,
  disabled,
  onCorner,
  onPoint,
}: {
  corner: RecordingCameraCorner;
  point: RecordingCameraPoint | null;
  size: RecordingCameraSize;
  aspect: number;
  disabled: boolean;
  onCorner: (c: RecordingCameraCorner) => void;
  onPoint: (p: RecordingCameraPoint) => void;
}) {
  const [dragPoint, setDragPoint] = useState<RecordingCameraPoint | null>(null);
  const fraction = webcamSizeFraction(size);
  const half = { x: fraction / 2, y: (fraction / 2) * aspect };
  const free = point !== null;
  const shown = dragPoint ?? point ?? webcamCornerPoint(corner, half);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>): void => {
    if (disabled || e.button !== 0) return;
    e.preventDefault();
    const pad = e.currentTarget;
    const box = pad.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return;
    const ring = (e.target as Element).closest<HTMLElement>("[data-corner]");
    const pressedCorner = CAMERA_CORNERS.find(
      (c) => c.value === ring?.dataset.corner,
    )?.value;
    const start = { x: e.clientX, y: e.clientY };
    const moved = (ev: { clientX: number; clientY: number }): boolean =>
      Math.hypot(ev.clientX - start.x, ev.clientY - start.y) > TAP_SLOP_PX;
    const at = (ev: { clientX: number; clientY: number }) =>
      clampWebcamPoint(
        {
          x: (ev.clientX - box.left) / box.width,
          y: (ev.clientY - box.top) / box.height,
        },
        half,
      );
    if (!pressedCorner) setDragPoint(at(e));
    const move = (ev: PointerEvent): void => {
      if (!pressedCorner || moved(ev)) setDragPoint(at(ev));
    };
    const end = (ev: PointerEvent): void => {
      pad.removeEventListener("pointermove", move);
      pad.removeEventListener("pointerup", end);
      pad.removeEventListener("pointercancel", end);
      setDragPoint(null);
      if (ev.type !== "pointerup") return;
      if (pressedCorner && !moved(ev)) {
        onCorner(pressedCorner);
        return;
      }
      const released = at(ev);
      const snapped = webcamCornerNear(released, half);
      if (snapped) onCorner(snapped);
      else onPoint(released);
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
        "relative mx-auto touch-none overflow-hidden rounded-lg border border-line bg-tint",
        disabled ? "opacity-50" : "cursor-crosshair",
      )}
      style={{
        aspectRatio: String(aspect),
        width: `min(100%, calc(9rem * ${aspect}))`,
      }}
    >
      {CAMERA_CORNERS.map((opt) => {
        const active = !free && corner === opt.value;
        const at = webcamCornerPoint(opt.value, half);
        return (
          <button
            key={opt.value}
            type="button"
            data-corner={opt.value}
            aria-label={opt.label}
            aria-pressed={active}
            disabled={disabled}
            onClick={(e) => {
              if (e.detail === 0) onCorner(opt.value);
            }}
            className={cn(
              "absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed transition-colors",
              active
                ? "border-transparent"
                : "border-line-strong hover:border-primary hover:bg-primary/10",
            )}
            style={{
              width: `${fraction * 100}%`,
              left: `${at.x * 100}%`,
              top: `${at.y * 100}%`,
            }}
          />
        );
      })}
      <div
        className="pointer-events-none absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-sm"
        style={{
          width: `${fraction * 100}%`,
          left: `${shown.x * 100}%`,
          top: `${shown.y * 100}%`,
        }}
      />
    </div>
  );
}

function OptionRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-full bg-tint py-1 pr-1 pl-4 text-sm text-fg">
      <span>{label}</span>
      <div role="radiogroup" aria-label={label} className="flex gap-0.5">
        {options.map((opt) => {
          const on = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(opt.value)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs transition-colors",
                on
                  ? "bg-primary/10 text-accent-strong"
                  : "text-fg-muted hover:text-fg",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
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
      className="flex w-full items-center justify-between rounded-full bg-tint px-4 py-1.5 text-sm text-fg hover:bg-tint-strong"
    >
      <span>{label}</span>
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs",
          on ? "text-accent-strong" : "text-fg-muted",
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
