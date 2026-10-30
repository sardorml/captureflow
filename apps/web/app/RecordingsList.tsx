"use client";

import { Card, Chip, EmptyState } from "@heroui/react";
import { Bot, Film } from "lucide-react";
import { FadeInImage } from "@/components/ui/fade-in-image";
import { ListToolbar } from "./_components/ListToolbar";
import { HoverPreview } from "./_components/HoverPreview";
import { parseRecordingConfigJson } from "@/lib/recording-config";
import { MediaCard } from "./_components/MediaCard";
import { SelectionBar, useSelection } from "./_components/selection";
import {
  deleteRecordingAction,
  renameRecordingAction,
  setVisibilityAction,
} from "./actions";
import type { Visibility } from "@/app/VisibilityDialog";
import { formatDuration } from "@/lib/format";
import { isFiltered, type ListFilters } from "@/lib/list-filters";
import type { DashboardRecordingRow } from "@/lib/recordings-db";
import { viewUrlFor } from "@/lib/site";

// Storage keys stay on the server; cards get ready-made URLs.
export type RecordingCardRow = Omit<
  DashboardRecordingRow,
  "storageKey" | "posterKey" | "posterThumbKey" | "webcamStorageKey"
> & {
  posterUrl: string | null;
  videoUrl: string | null;
  webcamUrl: string | null;
  videoThumbUrl: string | null;
};

type RecordingsListProps = {
  recordings: RecordingCardRow[];
  filters: ListFilters;
  viewerUserId?: string;
  viewerIsWorkspaceOwner?: boolean;
  allowPublicLinks?: boolean;
  workspaceName?: string | null;
  ownerNames?: Record<string, string>;
  ownerImages?: Record<string, string>;
};

export function RecordingsList({
  recordings,
  filters,
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
  const manageableKeys = manageable.map((r) => r.slug);
  const selection = useSelection(manageableKeys);
  const toolbar = (
    <ListToolbar
      noun="recording"
      filters={filters}
      selectAll={
        manageableKeys.length > 0
          ? {
              selected: selection.count,
              total: manageableKeys.length,
              onChange: (next) => selection.setAll(manageableKeys, next),
            }
          : undefined
      }
    />
  );

  if (recordings.length === 0) {
    return (
      <>
        {toolbar}
        <Card className="mt-6 p-6">
          <EmptyState className="text-center text-sm text-fg-muted">
            {isFiltered(filters)
              ? "No recordings match these filters."
              : "You haven\u2019t created any recording links yet. Record in the CaptureFlow desktop app and your recordings will show up here."}
          </EmptyState>
        </Card>
      </>
    );
  }
  return (
    <>
      {toolbar}
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
  recording: RecordingCardRow;
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
  const { posterUrl, posterBlur, videoUrl, webcamUrl, videoThumbUrl } =
    recording;
  const config = parseRecordingConfigJson(recording.configJson);
  // The card still carries the camera unless the owner hid it in the editor.
  const previewWebcamUrl = config.cameraHidden ? null : webcamUrl;

  const media = (hovered: boolean) => (
    <>
      {posterUrl ? (
        <>
          {posterBlur ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-110 object-cover blur-sm"
              src={posterBlur}
            />
          ) : null}
          {/* Lazy on purpose, first row included: an eager image is hoisted
              into <head> as a preload ahead of the stylesheet and delays
              first paint; a lazy one in view starts right after layout. */}
          <FadeInImage
            alt=""
            className="relative h-full w-full object-cover"
            src={posterUrl}
            width={recording.width ?? 1280}
            height={recording.height ?? 720}
          />
          {videoUrl ? (
            <HoverPreview
              src={videoUrl}
              webcamUrl={previewWebcamUrl}
              active={hovered}
            />
          ) : null}
        </>
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
      {recording.client === "agent" && (
        <Chip
          size="sm"
          className="absolute bottom-2 left-2 h-5 border-none bg-black/75 text-white"
        >
          <Bot size={14} aria-label="AI generated">
            <title>AI generated</title>
          </Bot>
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
      sizeBytes={recording.totalBytes}
      deleteConfirm={{
        title: "Delete this recording?",
        description:
          "The video and its link stop working immediately. This cannot be undone.",
      }}
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
