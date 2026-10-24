"use client";

import { Spinner } from "@heroui/react";
import {
  Check,
  ChevronRight,
  Code2,
  Download,
  Scissors,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  AudioControls,
  BackgroundPicker,
  CameraPicker,
} from "@/app/recordings/[id]/edit/EditorControls";
import type { SaveStatus } from "@/app/recordings/[id]/edit/use-editor-config";
import type { RecordingConfig } from "@/lib/recording-config";
import { RECORDING_SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  editUrl: string;
  config: RecordingConfig;
  onConfig: (patch: Partial<RecordingConfig>) => void;
  status: SaveStatus;
  hasWebcam: boolean;
};

const STATUS_LABEL: Record<SaveStatus, string> = {
  idle: "Saved automatically",
  saving: "Saving…",
  saved: "Saved",
  error: "Couldn't save",
};

// The owner's Edit tab in the viewer sidebar: the look of the recording is
// changed in place, the heavier edits open the editor.
export function EditPanel({
  slug,
  editUrl,
  config,
  onConfig,
  status,
  hasWebcam,
}: Props) {
  const [copied, setCopied] = useState(false);
  const embedCode = `<iframe src="${RECORDING_SITE_URL}/embed/${slug}" width="100%" style="aspect-ratio: 16 / 9; border: 0;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;

  const copyEmbed = (): void => {
    void navigator.clipboard
      .writeText(embedCode)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => setCopied(false));
  };

  return (
    <div className="flex flex-col gap-6">
      <section>
        <SectionHeading
          title="Make edits"
          aside={
            <span
              role="status"
              aria-live="polite"
              className={cn(
                "flex items-center gap-1.5 text-xs",
                status === "error" ? "text-danger" : "text-fg-muted",
              )}
            >
              {status === "saving" ? <Spinner size="sm" /> : null}
              {STATUS_LABEL[status]}
            </span>
          }
        />
        <ActionRow
          href={editUrl}
          icon={Scissors}
          title="Trim and cut"
          description="Split the timeline, cut sections out and fix the transcript."
        />
        <div className="mt-4 flex flex-col gap-4 rounded-2xl bg-panel-2 p-4">
          <Field label="Background">
            <BackgroundPicker
              background={config.background}
              onChange={(bg) => onConfig({ background: bg })}
            />
          </Field>
          {hasWebcam ? (
            <Field label="Camera">
              <CameraPicker
                corner={config.cameraCorner}
                size={config.cameraSize}
                onCorner={(corner) => onConfig({ cameraCorner: corner })}
                onSize={(size) => onConfig({ cameraSize: size })}
              />
            </Field>
          ) : null}
          <Field label="Audio">
            <AudioControls
              micMuted={config.micMuted}
              systemMuted={config.systemMuted}
              hasMic={hasWebcam}
              onMic={(muted) => onConfig({ micMuted: muted })}
              onSystem={(muted) => onConfig({ systemMuted: muted })}
            />
          </Field>
        </div>
      </section>

      <section>
        <SectionHeading title="Take action" />
        <ActionRow
          href={`/api/r/download?slug=${encodeURIComponent(slug)}`}
          icon={Download}
          title="Download video"
          description="The full recording as an MP4."
        />
        <ActionRow
          onPress={copyEmbed}
          icon={copied ? Check : Code2}
          title={copied ? "Embed code copied" : "Copy embed code"}
          description="Paste the player into any web page."
        />
      </section>
    </div>
  );
}

function SectionHeading({
  title,
  aside,
}: {
  title: string;
  aside?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h3 className="text-base font-semibold text-fg">{title}</h3>
      {aside}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold tracking-wider text-fg-muted uppercase">
        {label}
      </div>
      {children}
    </div>
  );
}

function ActionRow({
  href,
  onPress,
  icon: Icon,
  title,
  description,
}: {
  href?: string;
  onPress?: () => void;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  const body = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tint text-fg">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-fg">{title}</span>
        <span className="block text-xs leading-snug text-fg-muted">
          {description}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-fg-subtle" />
    </>
  );
  const className =
    "flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-tint";
  if (href) {
    return (
      <a href={href} className={className}>
        {body}
      </a>
    );
  }
  return (
    <button type="button" onClick={onPress} className={className}>
      {body}
    </button>
  );
}
