"use client";

import { Spinner } from "@/components/ui/spinner";
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
import { useAppMessages } from "@/components/app-i18n-provider";
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
  aspect: number;
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
  aspect,
}: Props) {
  const m = useAppMessages();
  const copy = m.viewer.editPanel;
  const statusLabel: Record<SaveStatus, string> = {
    idle: copy.status.idle,
    saving: m.common.saving,
    saved: copy.status.saved,
    error: copy.status.error,
  };
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
    <div data-split="edit-panel" className="flex flex-col gap-6">
      <section>
        <SectionHeading
          title={copy.makeEdits}
          aside={
            <span
              role="status"
              aria-live="polite"
              className={cn(
                "flex items-center gap-1.5 text-xs",
                status === "error" ? "text-destructive" : "text-fg-muted",
              )}
            >
              {status === "saving" ? <Spinner className="size-4" /> : null}
              {statusLabel[status]}
            </span>
          }
        />
        <ActionRow
          href={editUrl}
          icon={Scissors}
          title={copy.trimTitle}
          description={copy.trimDescription}
        />
        <div className="mt-5 flex flex-col gap-5 px-2">
          <Field label={copy.background}>
            <BackgroundPicker
              background={config.background}
              onChange={(bg) => onConfig({ background: bg })}
            />
          </Field>
          {hasWebcam ? (
            <Field label={copy.camera}>
              <CameraPicker
                corner={config.cameraCorner}
                point={config.cameraPoint}
                size={config.cameraSize}
                hidden={config.cameraHidden}
                aspect={aspect}
                onCorner={(corner) =>
                  onConfig({ cameraCorner: corner, cameraPoint: null })
                }
                onPoint={(point) => onConfig({ cameraPoint: point })}
                onSize={(size) => onConfig({ cameraSize: size })}
                onHidden={(hidden) => onConfig({ cameraHidden: hidden })}
              />
            </Field>
          ) : null}
          <Field label={copy.audio}>
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
        <SectionHeading title={copy.takeAction} />
        <ActionRow
          href={`/api/r/download?slug=${encodeURIComponent(slug)}`}
          icon={Download}
          title={copy.downloadTitle}
          description={copy.downloadDescription}
        />
        <ActionRow
          onPress={copyEmbed}
          icon={copied ? Check : Code2}
          title={copied ? copy.embedCopied : copy.copyEmbed}
          description={copy.embedDescription}
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
