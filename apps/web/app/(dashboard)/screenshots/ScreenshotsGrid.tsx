"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { ListToolbar } from "../../_components/ListToolbar";
import { MediaCard } from "../../_components/MediaCard";
import { SelectionBar, useSelection } from "../../_components/selection";
import {
  deleteScreenshotAction,
  renameScreenshotAction,
  setScreenshotVisibilityAction,
} from "../../actions";
import type { Visibility } from "@/app/VisibilityDialog";
import { FadeInImage } from "@/components/ui/fade-in-image";
import { isFiltered, type ListFilters } from "@/lib/list-filters";
import type { DashboardScreenshotRow } from "@/lib/screenshots-db";
import { CDN_BASE_URL, screenshotViewUrlFor } from "@/lib/site";

// R2 is served with long cache headers, so cache-bust by tagging the URL with
// the freshest mutation timestamp; otherwise overwrites serve stale bytes.
function publicScreenshotImageUrl(screenshot: DashboardScreenshotRow): string {
  const v = screenshot.editedAt ?? screenshot.updatedAt ?? screenshot.createdAt;
  return `${CDN_BASE_URL}/${screenshot.storageKey}?v=${v}`;
}

type ScreenshotsGridProps = {
  screenshots: DashboardScreenshotRow[];
  filters: ListFilters;
  viewerUserId?: string;
  viewerIsWorkspaceOwner?: boolean;
  allowPublicLinks?: boolean;
  workspaceName?: string | null;
  ownerNames?: Record<string, string>;
  ownerImages?: Record<string, string>;
};

export function ScreenshotsGrid({
  screenshots,
  filters,
  viewerUserId,
  viewerIsWorkspaceOwner,
  allowPublicLinks = true,
  workspaceName,
  ownerNames,
  ownerImages,
}: ScreenshotsGridProps) {
  const manageable = screenshots.filter(
    (s) => !viewerUserId || s.userId === viewerUserId || viewerIsWorkspaceOwner,
  );
  const manageableKeys = manageable.map((s) => s.id);
  const selection = useSelection(manageableKeys);
  const toolbar = (
    <ListToolbar
      noun="screenshot"
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

  if (screenshots.length === 0) {
    return (
      <>
        {toolbar}
        <Card className="mt-6 p-6">
          <Empty className="p-0 text-center text-sm text-fg-muted">
            {isFiltered(filters)
              ? "No screenshots match these filters."
              : "No screenshots yet. Open CaptureFlow \u2192 Screenshot tab \u2192 pick a Display, Window, or Area to capture. Your screenshot appears here automatically."}
          </Empty>
        </Card>
      </>
    );
  }
  return (
    <>
      {toolbar}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {screenshots.map((screenshot) => {
          const isAuthor = !viewerUserId || screenshot.userId === viewerUserId;
          const isAdmin = !isAuthor && Boolean(viewerIsWorkspaceOwner);
          const canManage = isAuthor || isAdmin;
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
              selected={selection.has(screenshot.id)}
              selectionActive={selection.count > 0}
              onSelectedChange={
                canManage
                  ? (next) => selection.set(screenshot.id, next)
                  : undefined
              }
            />
          );
        })}
      </div>

      <SelectionBar
        noun="screenshot"
        selection={selection}
        onDelete={(id) => deleteScreenshotAction(id)}
      />
    </>
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
  selected,
  selectionActive,
  onSelectedChange,
}: {
  screenshot: DashboardScreenshotRow;
  canAuthor: boolean;
  canAdminister: boolean;
  allowPublicLinks: boolean;
  workspaceName?: string | null;
  authorName?: string | null;
  authorImage?: string | null;
  selected: boolean;
  selectionActive: boolean;
  onSelectedChange?: (next: boolean) => void;
}) {
  const displayTitle =
    screenshot.title?.trim() || `Screenshot ${screenshot.id}`;

  const media = (
    <>
      <FadeInImage
        src={publicScreenshotImageUrl(screenshot)}
        alt={displayTitle}
        width={screenshot.width}
        height={screenshot.height}
        className="h-full w-full object-cover"
      />
      <Badge className="absolute right-2 bottom-2 border-none bg-black/75 text-white">
        {screenshot.width}×{screenshot.height}
      </Badge>
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
      deleteConfirm={{
        title: "Delete this screenshot?",
        description:
          "The image and its link stop working immediately. This cannot be undone.",
      }}
      selected={selected}
      selectionActive={selectionActive}
      onSelectedChange={onSelectedChange}
      onRename={(next) => renameScreenshotAction(screenshot.id, next.trim())}
      onDelete={() => deleteScreenshotAction(screenshot.id)}
      onChangeVisibility={(next: Visibility) =>
        setScreenshotVisibilityAction(screenshot.id, next)
      }
    />
  );
}
