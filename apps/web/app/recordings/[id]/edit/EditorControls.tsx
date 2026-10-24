"use client";

import { Mic, MicOff, Volume2, VolumeX, type LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatBytes, formatDuration } from "@/lib/format";
import {
  RECORDING_GRADIENT_KEYS,
  RECORDING_GRADIENT_PRESETS,
  isRecordingHexColor,
  recordingGradientCss,
  type RecordingCameraCorner,
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
  size,
  onCorner,
  onSize,
}: {
  corner: RecordingCameraCorner;
  size: RecordingCameraSize;
  onCorner: (c: RecordingCameraCorner) => void;
  onSize: (s: RecordingCameraSize) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-[10px] uppercase tracking-wide text-fg-muted">
        Position
      </div>
      <div className="grid grid-cols-2 gap-2">
        {CAMERA_CORNERS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onCorner(opt.value)}
            aria-pressed={corner === opt.value}
            className={cn(
              "rounded-xl border px-3 py-2 text-xs transition-colors",
              corner === opt.value
                ? "border-accent bg-accent-soft text-accent"
                : "border-transparent bg-tint text-fg-muted hover:bg-tint-strong",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
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
  return (
    <div>
      <AudioToggle
        label="System sound"
        muted={systemMuted}
        onChange={onSystem}
        MutedIcon={VolumeX}
        OnIcon={Volume2}
      />
      {hasMic ? (
        <div className="mt-1.5">
          <AudioToggle
            label="Microphone"
            muted={micMuted}
            onChange={onMic}
            MutedIcon={MicOff}
            OnIcon={Mic}
          />
        </div>
      ) : (
        <p className="mt-1.5 text-[11px] text-fg-muted">
          No microphone track on this recording.
        </p>
      )}
    </div>
  );
}

function AudioToggle({
  label,
  muted,
  onChange,
  MutedIcon,
  OnIcon,
}: {
  label: string;
  muted: boolean;
  onChange: (muted: boolean) => void;
  MutedIcon: LucideIcon;
  OnIcon: LucideIcon;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!muted}
      onClick={() => onChange(!muted)}
      className="flex w-full items-center justify-between rounded-full bg-field px-4 py-1.5 text-sm text-fg hover:bg-tint-strong"
    >
      <span>{label}</span>
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs",
          muted ? "text-fg-muted" : "text-accent",
        )}
      >
        {muted ? (
          <MutedIcon className="h-3.5 w-3.5" />
        ) : (
          <OnIcon className="h-3.5 w-3.5" />
        )}
        {muted ? "Muted" : "On"}
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
