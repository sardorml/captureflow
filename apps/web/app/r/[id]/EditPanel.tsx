"use client";

import {
  Captions,
  Check,
  ChevronRight,
  Code2,
  Download,
  FileVideo,
  Loader2,
  Scissors,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAppMessages } from "@/components/app-i18n-provider";
import { fmt } from "@/lib/i18n/format";
import type { RecordingConfig } from "@/lib/recording-config";
import { needsRender, type ExportSources } from "@/lib/recording/export-plan";
import { RECORDING_SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Props = {
  slug: string;
  editUrl: string;
  title: string;
  config: RecordingConfig;
  exportSources: ExportSources | null;
  hasTranscript: boolean;
};

type Render =
  | { phase: "idle" }
  | { phase: "rendering"; progress: number }
  | { phase: "failed"; unsupported: boolean };

export function EditPanel({
  slug,
  editUrl,
  title,
  config,
  exportSources,
  hasTranscript,
}: Props) {
  const m = useAppMessages();
  const copy = m.viewer.editPanel;
  const [copied, setCopied] = useState(false);
  const [render, setRender] = useState<Render>({ phase: "idle" });
  const abortRef = useRef<AbortController | null>(null);
  const originalUrl = `/api/r/download?slug=${encodeURIComponent(slug)}`;
  const embedCode = `<iframe src="${RECORDING_SITE_URL}/embed/${slug}" width="100%" style="aspect-ratio: 16 / 9; border: 0;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;

  useEffect(() => () => abortRef.current?.abort(), []);

  const copyEmbed = (): void => {
    void navigator.clipboard
      .writeText(embedCode)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => setCopied(false));
  };

  const download = async (): Promise<void> => {
    if (render.phase === "rendering") return;
    if (!exportSources || !needsRender(config, !!exportSources.webcamUrl)) {
      saveUrl(originalUrl);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setRender({ phase: "rendering", progress: 0 });
    try {
      const { renderEditedVideo } = await import("./export-video");
      let shown = 0;
      const blob = await renderEditedVideo(
        exportSources,
        config,
        (fraction) => {
          const pct = Math.floor(fraction * 100);
          if (pct === shown) return;
          shown = pct;
          setRender({ phase: "rendering", progress: pct });
        },
        controller.signal,
      );
      const url = URL.createObjectURL(blob);
      saveUrl(url, `${fileNameFor(title, slug)}.mp4`);
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setRender({ phase: "idle" });
    } catch (error) {
      if (controller.signal.aborted) {
        setRender({ phase: "idle" });
        return;
      }
      console.error("[export]", error);
      const { ExportUnsupportedError } = await import("./export-video");
      setRender({
        phase: "failed",
        unsupported: error instanceof ExportUnsupportedError,
      });
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const downloadDescription =
    render.phase === "rendering"
      ? fmt(copy.downloadRendering, { percent: String(render.progress) })
      : render.phase === "failed"
        ? render.unsupported
          ? copy.downloadUnsupported
          : copy.downloadFailed
        : copy.downloadDescription;

  return (
    <div data-split="edit-panel" className="flex flex-col">
      <ActionRow
        href={editUrl}
        icon={Scissors}
        title={copy.editTitle}
        description={copy.editDescription}
      />
      <ActionRow
        onPress={
          render.phase === "rendering" ? undefined : () => void download()
        }
        icon={render.phase === "rendering" ? Loader2 : Download}
        spinning={render.phase === "rendering"}
        title={copy.downloadTitle}
        description={downloadDescription}
        progress={render.phase === "rendering" ? render.progress : null}
        trailing={
          render.phase === "rendering" ? (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-fg-muted hover:bg-tint-strong hover:text-fg"
            >
              {copy.downloadCancel}
            </button>
          ) : undefined
        }
      />
      {exportSources ? (
        <ActionRow
          href={originalUrl}
          download
          icon={FileVideo}
          title={copy.originalTitle}
          description={copy.originalDescription}
        />
      ) : null}
      {hasTranscript ? (
        <ActionRow
          href={`/api/r/transcript/${encodeURIComponent(slug)}/captions?format=srt`}
          download
          icon={Captions}
          title={copy.captionsTitle}
          description={copy.captionsDescription}
        />
      ) : null}
      <ActionRow
        onPress={copyEmbed}
        icon={copied ? Check : Code2}
        title={copied ? copy.embedCopied : copy.copyEmbed}
        description={copy.embedDescription}
      />
    </div>
  );
}

function saveUrl(url: string, fileName?: string): void {
  const a = document.createElement("a");
  a.href = url;
  if (fileName) a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function fileNameFor(title: string, slug: string): string {
  const clean = title
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return clean || `captureflow-${slug}`;
}

function ActionRow({
  href,
  download,
  onPress,
  icon: Icon,
  spinning,
  title,
  description,
  progress = null,
  trailing,
}: {
  href?: string;
  download?: boolean;
  onPress?: () => void;
  icon: LucideIcon;
  spinning?: boolean;
  title: string;
  description: string;
  progress?: number | null;
  trailing?: ReactNode;
}) {
  const body = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tint text-fg">
        <Icon className={cn("h-5 w-5", spinning && "animate-spin")} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-fg">{title}</span>
        <span className="block text-xs leading-snug text-fg-muted">
          {description}
        </span>
        {progress !== null ? (
          <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-tint">
            <span
              className="block h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </span>
        ) : null}
      </span>
      {trailing ?? <ChevronRight className="h-4 w-4 shrink-0 text-fg-subtle" />}
    </>
  );
  const className =
    "flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-tint";
  if (href && download) {
    return (
      <a href={href} download className={className}>
        {body}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }
  if (!onPress) {
    return <div className={cn(className, "hover:bg-transparent")}>{body}</div>;
  }
  return (
    <button type="button" onClick={onPress} className={className}>
      {body}
    </button>
  );
}
