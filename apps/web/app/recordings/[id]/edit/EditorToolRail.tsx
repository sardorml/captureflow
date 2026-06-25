"use client";

import { type ReactNode } from "react";
import {
  Camera,
  Image as ImageIcon,
  Info,
  Lock,
  Shapes,
  Volume2,
} from "lucide-react";
import { Popover, Tooltip } from "antd";
import type { RecordingConfig } from "@/lib/recording-config";
import {
  AudioControls,
  BackgroundPicker,
  CameraPicker,
  DetailsList,
  type RecordingDetails,
} from "./EditorControls";

type Props = {
  config: RecordingConfig;
  onConfig: (patch: Partial<RecordingConfig>) => void;
  hasWebcam: boolean;
  details: RecordingDetails;
};

// Far-right tool rail. Each tool opens its controls in a popover, Loom-style;
// "Add overlay" is the one genuine placeholder (no overlay-asset pipeline yet).
export function EditorToolRail({
  config,
  onConfig,
  hasWebcam,
  details,
}: Props) {
  return (
    <div className="flex w-[88px] shrink-0 flex-col items-center gap-2 border-l border-line bg-canvas-2 p-2 pt-4">
      <LockedTool icon={<Shapes className="h-5 w-5" />} label="Add overlay" />
      <PopoverTool
        icon={<ImageIcon className="h-5 w-5" />}
        label="Background"
        title="Background"
        content={
          <BackgroundPicker
            background={config.background}
            onChange={(bg) => onConfig({ background: bg })}
          />
        }
      />
      {hasWebcam ? (
        <PopoverTool
          icon={<Camera className="h-5 w-5" />}
          label="Camera"
          title="Camera"
          content={
            <CameraPicker
              corner={config.cameraCorner}
              size={config.cameraSize}
              onCorner={(corner) => onConfig({ cameraCorner: corner })}
              onSize={(size) => onConfig({ cameraSize: size })}
            />
          }
        />
      ) : null}
      <PopoverTool
        icon={<Volume2 className="h-5 w-5" />}
        label="Audio"
        title="Audio"
        content={
          <AudioControls
            micMuted={config.micMuted}
            systemMuted={config.systemMuted}
            hasMic={hasWebcam}
            onMic={(muted) => onConfig({ micMuted: muted })}
            onSystem={(muted) => onConfig({ systemMuted: muted })}
          />
        }
      />
      <PopoverTool
        icon={<Info className="h-5 w-5" />}
        label="Details"
        title="Details"
        content={<DetailsList {...details} />}
      />
    </div>
  );
}

function PopoverTool({
  icon,
  label,
  title,
  content,
}: {
  icon: ReactNode;
  label: string;
  title: string;
  content: ReactNode;
}) {
  return (
    <Popover
      trigger="click"
      placement="leftTop"
      title={title}
      content={<div className="w-60">{content}</div>}
    >
      <button
        type="button"
        className="flex w-full cursor-pointer flex-col items-center gap-1 rounded-md p-1 text-fg-muted transition-colors hover:text-fg"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-canvas transition-colors hover:border-line-strong">
          {icon}
        </span>
        <span className="text-center text-[10px] leading-tight">{label}</span>
      </button>
    </Popover>
  );
}

function LockedTool({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Tooltip title="Coming soon" placement="left">
      <span className="flex w-full cursor-not-allowed flex-col items-center gap-1 p-1 text-fg-subtle opacity-70">
        <span className="relative flex h-10 w-10 items-center justify-center rounded-md border border-line bg-canvas">
          {icon}
          <Lock className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-canvas-2 p-px" />
        </span>
        <span className="text-center text-[10px] leading-tight">{label}</span>
      </span>
    </Tooltip>
  );
}
