"use client";

import Image from "next/image";
import { Card, Empty, Tag } from "antd";
import type { DashboardScreenshotRow } from "@/lib/screenshots-db";
import type { Visibility } from "@/app/VisibilityDialog";
import { screenshotViewUrlFor } from "@/lib/site";
import {
  deleteScreenshotAction,
  renameScreenshotAction,
  setScreenshotVisibilityAction,
} from "../../actions";
import { MediaCard } from "../../_components/MediaCard";

const R2_BASE =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "https://cdn.captureflow.xyz";

// R2 is served with long cache headers, so cache-bust by tagging the URL with
// the freshest mutation timestamp; otherwise overwrites serve stale bytes.
function publicScreenshotImageUrl(screenshot: DashboardScreenshotRow): string {
  const v = screenshot.editedAt ?? screenshot.updatedAt ?? screenshot.createdAt;
  return `${R2_BASE}/${screenshot.storageKey}?v=${v}`;
}

type ScreenshotsGridProps = {
  screenshots: DashboardScreenshotRow[];
  viewerUserId?: string;
  viewerIsWorkspaceOwner?: boolean;
  allowPublicLinks?: boolean;
  workspaceName?: string | null;
  ownerNames?: Record<string, string>;
  ownerImages?: Record<string, string>;
};

export function ScreenshotsGrid({
  screenshots,
  viewerUserId,
  viewerIsWorkspaceOwner,
  allowPublicLinks = true,
  workspaceName,
  ownerNames,
  ownerImages,
}: ScreenshotsGridProps) {
  if (screenshots.length === 0) {
    return (
      <Card style={{ marginTop: 24 }}>
        <Empty
          description={
            <span>
              No screenshots yet. Open CaptureFlow → Screenshot tab → pick a
              Display, Window, or Area to capture. Your screenshot appears here
              automatically.
            </span>
          }
        />
      </Card>
    );
  }
  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {screenshots.map((screenshot) => {
        const isAuthor = !viewerUserId || screenshot.userId === viewerUserId;
        const isAdmin = !isAuthor && Boolean(viewerIsWorkspaceOwner);
        return (
          <ScreenshotCard
            key={screenshot.id}
            screenshot={screenshot}
            canAuthor={isAuthor}
            canAdminister={isAdmin}
            allowPublicLinks={allowPublicLinks}
            workspaceName={workspaceName}
            authorName={ownerNames?.[screenshot.userId] ?? null}
            authorImage={ownerImages?.[screenshot.userId] ?? null}
          />
        );
      })}
    </div>
  );
}

function ScreenshotCard({
  screenshot,
  canAuthor,
  canAdminister,
  allowPublicLinks,
  workspaceName,
  authorName,
  authorImage,
}: {
  screenshot: DashboardScreenshotRow;
  canAuthor: boolean;
  canAdminister: boolean;
  allowPublicLinks: boolean;
  workspaceName?: string | null;
  authorName?: string | null;
  authorImage?: string | null;
}) {
  const displayTitle =
    screenshot.title?.trim() || `Screenshot ${screenshot.id}`;

  const media = (
    <>
      <Image
        src={publicScreenshotImageUrl(screenshot)}
        alt={displayTitle}
        width={screenshot.width}
        height={screenshot.height}
        unoptimized
        style={{ height: "100%", width: "100%", objectFit: "cover" }}
      />
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
        {screenshot.width}×{screenshot.height}
      </Tag>
    </>
  );

  return (
    <MediaCard
      noun="screenshot"
      media={media}
      viewUrl={screenshotViewUrlFor(screenshot.id)}
      editUrl={`/screenshots/${screenshot.id}/edit`}
      displayTitle={displayTitle}
      initialTitle={screenshot.title ?? ""}
      titlePlaceholder="Untitled screenshot"
      authorLabel={authorName ?? "Unknown"}
      authorImage={authorImage}
      createdAt={screenshot.createdAt}
      visibility={screenshot.visibility}
      workspaceName={workspaceName}
      allowPublicLinks={allowPublicLinks}
      canAuthor={canAuthor}
      canManage={canAuthor || canAdminister}
      stats={{ views: screenshot.viewCount, comments: 0, reactions: 0 }}
      sizeBytes={screenshot.sizeBytes}
      deleteConfirm="Delete this screenshot? The public link will stop working."
      onRename={(next) => renameScreenshotAction(screenshot.id, next.trim())}
      onDelete={() => deleteScreenshotAction(screenshot.id)}
      onChangeVisibility={(next: Visibility) =>
        setScreenshotVisibilityAction(screenshot.id, next)
      }
    />
  );
}
