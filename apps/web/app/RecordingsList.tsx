"use client";

import { formatDuration } from "@/lib/format";
import { Card, Chip, EmptyState } from "@heroui/react";
import { Film } from "lucide-react";
import type { DashboardRecordingRow } from "@/lib/recordings-db";
import type { Visibility } from "@/app/VisibilityDialog";
import { viewUrlFor } from "@/lib/site";
import {
  deleteRecordingAction,
  renameRecordingAction,
  setVisibilityAction,
} from "./actions";
import { MediaCard } from "./_components/MediaCard";
import { SelectionBar, useSelection } from "./_components/selection";

const CDN_BASE_URL =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "https://cdn.captureflow.xyz";

type RecordingsListProps = {
  recordings: DashboardRecordingRow[];
  viewerUserId?: string;
  viewerIsWorkspaceOwner?: boolean;
  allowPublicLinks?: boolean;
  workspaceName?: string | null;
  ownerNames?: Record<string, string>;
  ownerImages?: Record<string, string>;
};

export function RecordingsList({
  recordings,
  viewerUserId,
  viewerIsWorkspaceOwner,
  allowPublicLinks = true,
  workspaceName,
  ownerNames,
  ownerImages,
}: RecordingsListProps) {
  const manageable = recordings.filter(
    (r) => !viewerUserId || r.userId === viewerUserId || viewerIsWorkspaceOwner,
  );
  const selection = useSelection(manageable.map((r) => r.slug));

  if (recordings.length === 0) {
    return (
      <Card className="mt-6 p-6">
        <EmptyState className="text-center text-sm text-fg-muted">
          You haven&rsquo;t created any recording links yet. Record in the
          CaptureFlow desktop app and your recordings will show up here.
        </EmptyState>
      </Card>
    );
  }
  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {recordings.map((s) => {
          const isAuthor = !viewerUserId || s.userId === viewerUserId;
          const isAdmin = !isAuthor && Boolean(viewerIsWorkspaceOwner);
          const canManage = isAuthor || isAdmin;
          return (
            <RecordingCard
              key={s.slug}
              recording={s}
              canAuthor={isAuthor}
              canAdminister={isAdmin}
              allowPublicLinks={allowPublicLinks}
              workspaceName={workspaceName}
              authorName={ownerNames?.[s.userId] ?? null}
              authorImage={ownerImages?.[s.userId] ?? null}
              selected={selection.has(s.slug)}
              selectionActive={selection.count > 0}
              onSelectedChange={
                canManage ? (next) => selection.set(s.slug, next) : undefined
              }
            />
          );
        })}
      </div>

      <SelectionBar
        noun="recording"
        selection={selection}
        onDelete={(slug) => deleteRecordingAction(slug)}
      />
    </>
  );
}

type RecordingCardProps = {
  recording: DashboardRecordingRow;
  canAuthor: boolean;
  canAdminister: boolean;
  allowPublicLinks: boolean;
  workspaceName?: string | null;
  authorName?: string | null;
  authorImage?: string | null;
  selected: boolean;
  selectionActive: boolean;
  onSelectedChange?: (next: boolean) => void;
};

function RecordingCard({
  recording,
  canAuthor,
  canAdminister,
  allowPublicLinks,
  workspaceName,
  authorName,
  authorImage,
  selected,
  selectionActive,
  onSelectedChange,
}: RecordingCardProps) {
  const posterUrl = recording.posterKey
    ? `${CDN_BASE_URL}/${recording.posterKey}`
    : null;
  const videoThumbUrl =
    recording.state === "ready" && !posterUrl
      ? `${CDN_BASE_URL}/${recording.storageKey}?v=${recording.sizeBytes}`
      : null;

  const media = (
    <>
      {posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          style={{ height: "100%", width: "100%", objectFit: "cover" }}
          decoding="async"
          loading="lazy"
          src={posterUrl}
        />
      ) : videoThumbUrl ? (
        <video
          style={{
            height: "100%",
            width: "100%",
            objectFit: "cover",
            pointerEvents: "none",
          }}
          src={videoThumbUrl}
          preload="metadata"
          muted
          playsInline
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-fg-subtle">
          <Film size={24} />
        </div>
      )}
      {recording.durationMs != null && (
        <Chip
          size="sm"
          className="absolute right-2 bottom-2 border-none bg-black/75 text-white"
        >
          {formatDuration(recording.durationMs)}
        </Chip>
      )}
      {recording.state !== "ready" && (
        <Chip size="sm" color="warning" className="absolute top-2 left-2">
          {recording.state}
        </Chip>
      )}
    </>
  );

  return (
    <MediaCard
      noun="recording"
      media={media}
      viewUrl={viewUrlFor(recording.slug)}
      editUrl={`/recordings/${recording.slug}/edit`}
      displayTitle={recording.title?.trim() || "Untitled recording"}
      initialTitle={recording.title ?? ""}
      titlePlaceholder="Untitled recording"
      authorLabel={authorName ?? "Unknown"}
      authorImage={authorImage}
      createdAt={recording.createdAt}
      visibility={recording.visibility}
      workspaceName={workspaceName}
      allowPublicLinks={allowPublicLinks}
      canAuthor={canAuthor}
      canManage={canAuthor || canAdminister}
      stats={{
        views: recording.viewCount,
        comments: recording.commentCount,
        reactions: recording.reactionCount,
      }}
      sizeBytes={recording.sizeBytes}
      deleteConfirm="Delete this recording permanently? The video and link will stop working immediately."
      selected={selected}
      selectionActive={selectionActive}
      onSelectedChange={onSelectedChange}
      onRename={async (next) => {
        const form = new FormData();
        form.set("slug", recording.slug);
        form.set("title", next);
        const res = await renameRecordingAction(
          { error: null, slug: null },
          form,
        );
        return { error: res.error };
      }}
      onDelete={() => deleteRecordingAction(recording.slug)}
      onChangeVisibility={(next: Visibility) =>
        setVisibilityAction(recording.slug, next)
      }
    />
  );
}
