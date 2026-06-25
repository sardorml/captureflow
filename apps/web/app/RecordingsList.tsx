"use client";

import { formatDuration } from "@/lib/format";
import { Card, Empty, Flex, Tag } from "antd";
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
  if (recordings.length === 0) {
    return (
      <Card style={{ marginTop: 24 }}>
        <Empty description="You haven't created any recording links yet. Record in the CaptureFlow desktop app and your recordings will show up here." />
      </Card>
    );
  }
  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {recordings.map((s) => {
        const isAuthor = !viewerUserId || s.userId === viewerUserId;
        const isAdmin = !isAuthor && Boolean(viewerIsWorkspaceOwner);
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
          />
        );
      })}
    </div>
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
};

function RecordingCard({
  recording,
  canAuthor,
  canAdminister,
  allowPublicLinks,
  workspaceName,
  authorName,
  authorImage,
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
        <Flex
          align="center"
          justify="center"
          style={{ height: "100%", width: "100%" }}
          className="text-fg-subtle"
        >
          <Film size={24} />
        </Flex>
      )}
      {recording.durationMs != null && (
        <Tag
          style={{
            position: "absolute",
            right: 8,
            bottom: 8,
            margin: 0,
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            border: "none",
          }}
        >
          {formatDuration(recording.durationMs)}
        </Tag>
      )}
      {recording.state !== "ready" && (
        <Tag
          color="warning"
          style={{ position: "absolute", left: 8, top: 8, margin: 0 }}
        >
          {recording.state}
        </Tag>
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
