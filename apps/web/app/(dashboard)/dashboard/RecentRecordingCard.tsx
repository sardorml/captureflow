import type { ReactNode } from "react";
import { Bot, Eye, Film, MessageSquare, Smile } from "lucide-react";
import { Avatar } from "@heroui/react";
import { PostedAt } from "@/app/_components/PostedAt";
import { FadeInImage } from "@/components/ui/fade-in-image";
import { formatDuration, initials } from "@/lib/format";
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
  commentCount: number;
  reactionCount: number;
  createdAt: number;
  author: { name: string; image: string | null } | null;
  ready: boolean;
  aiGenerated: boolean;
};

function recordingTitle(title: string | null): string {
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
        <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs text-fg-muted">
          {recording.author && (
            <>
              <Avatar className="size-5 shrink-0">
                {recording.author.image && (
                  <Avatar.Image
                    src={recording.author.image}
                    alt={recording.author.name}
                  />
                )}
                <Avatar.Fallback className="text-[9px]">
                  {initials(recording.author.name)}
                </Avatar.Fallback>
              </Avatar>
              <span className="truncate font-medium text-fg">
                {recording.author.name}
              </span>
              <span aria-hidden>·</span>
            </>
          )}
          <PostedAt at={recording.createdAt} className="shrink-0" />
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-fg-muted">
          <Count icon={<Eye size={12} />} n={recording.viewCount} noun="view" />
          <Count
            icon={<MessageSquare size={12} />}
            n={recording.commentCount}
            noun="comment"
          />
          <Count
            icon={<Smile size={12} />}
            n={recording.reactionCount}
            noun="reaction"
          />
        </div>
      </div>
    </a>
  );
}

function Count({
  icon,
  n,
  noun,
}: {
  icon: ReactNode;
  n: number;
  noun: string;
}) {
  return (
    <span
      className="flex items-center gap-1 tabular-nums"
      aria-label={`${n} ${noun}${n === 1 ? "" : "s"}`}
    >
      <span aria-hidden className="flex">
        {icon}
      </span>
      {n}
    </span>
  );
}

function RecordingPoster({ recording }: { recording: RecentRecording }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-tint ring-1 ring-line">
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
      {recording.aiGenerated && recording.ready && (
        <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
          <Bot
            size={12}
            className="inline align-middle"
            aria-label="AI generated"
          >
            <title>AI generated</title>
          </Bot>
        </span>
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
