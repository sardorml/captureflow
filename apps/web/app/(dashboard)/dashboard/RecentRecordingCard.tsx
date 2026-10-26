import { Eye, Film } from "lucide-react";
import { FadeInImage } from "@/components/ui/fade-in-image";
import { formatDuration, formatRelativeShort } from "@/lib/format";
import { viewUrlFor } from "@/lib/site";

export type RecentRecording = {
  slug: string;
  title: string | null;
  posterUrl: string | null;
  posterBlur: string | null;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  viewCount: number;
  createdAt: number;
  ready: boolean;
};

export function recordingTitle(title: string | null): string {
  return title?.trim() || "Untitled recording";
}

export function RecentRecordingCard({
  recording,
}: {
  recording: RecentRecording;
}) {
  return (
    <a
      href={viewUrlFor(recording.slug)}
      className="group flex flex-col gap-2.5 rounded-2xl p-2 transition-colors hover:bg-tint"
    >
      <RecordingPoster recording={recording} />
      <div className="min-w-0 px-1">
        <p className="truncate text-sm font-medium text-fg-strong">
          {recordingTitle(recording.title)}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-fg-muted">
          <Eye size={12} aria-hidden />
          {recording.viewCount} {recording.viewCount === 1 ? "view" : "views"}
          <span aria-hidden>·</span>
          {formatRelativeShort(recording.createdAt)}
        </p>
      </div>
    </a>
  );
}

export function RecordingPoster({
  recording,
  className = "aspect-video w-full rounded-xl",
}: {
  recording: Pick<
    RecentRecording,
    "posterUrl" | "posterBlur" | "width" | "height" | "durationMs" | "ready"
  >;
  className?: string;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-tint ring-1 ring-line ${className}`}
    >
      {recording.posterBlur && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-sm"
          src={recording.posterBlur}
        />
      )}
      {recording.posterUrl ? (
        <FadeInImage
          alt=""
          className="relative h-full w-full object-cover"
          src={recording.posterUrl}
          width={recording.width ?? 1280}
          height={recording.height ?? 720}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-fg-subtle">
          <Film size={20} aria-hidden />
        </div>
      )}
      {!recording.ready ? (
        <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
          Processing
        </span>
      ) : recording.durationMs ? (
        <span className="absolute right-1.5 bottom-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white">
          {formatDuration(recording.durationMs)}
        </span>
      ) : null}
    </div>
  );
}
