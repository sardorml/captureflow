'use client';

import Image from 'next/image';
import { initials, formatBytes, formatRelativeShort as formatRelative } from '@/lib/format';
import Link from 'next/link';
import { forwardRef, useState, useTransition, type FormEvent } from 'react';
import type React from 'react';
import {
  Check,
  ChevronDown,
  ExternalLink,
  Eye,
  Link2,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Smile,
  Trash2,
} from 'lucide-react';
import type { DashboardSnapRow, SnapVisibility } from '@/lib/snaps-db';
import { snapViewUrlFor } from '@/lib/site';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  SmoothDropdownMenu,
  SmoothDropdownMenuContent,
  SmoothDropdownMenuItem,
  SmoothDropdownMenuTrigger,
} from '@captureflow/ui';
import {
  deleteSnapAction,
  renameSnapAction,
  setSnapVisibilityAction,
} from '../../actions';
import { VisibilityDialog } from '../../VisibilityDialog';

const R2_BASE =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? 'https://cdn.captureflow.xyz';

// R2 is served with long cache headers, so cache-bust by tagging the URL with
// the freshest mutation timestamp; otherwise overwrites serve stale bytes.
function publicSnapImageUrl(snap: DashboardSnapRow): string {
  const v = snap.editedAt ?? snap.updatedAt ?? snap.createdAt;
  return `${R2_BASE}/${snap.storageKey}?v=${v}`;
}

function publicSnapViewUrl(id: string): string {
  return snapViewUrlFor(id);
}

type SnapsGridProps = {
  snaps: DashboardSnapRow[];
  viewerUserId?: string;
  viewerIsWorkspaceOwner?: boolean;
  allowPublicLinks?: boolean;
  ownerNames?: Record<string, string>;
  ownerImages?: Record<string, string>;
};

export function SnapsGrid({
  snaps,
  viewerUserId,
  viewerIsWorkspaceOwner,
  allowPublicLinks = true,
  ownerNames,
  ownerImages,
}: SnapsGridProps) {
  if (snaps.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-line bg-neutral-900/40 px-6 py-16 text-center">
        <h3 className="text-sm font-medium text-neutral-200">No snaps yet</h3>
        <p className="mt-2 text-xs text-neutral-500">
          Open CaptureFlow → Screenshot tab → pick a Display, Window, or Area to
          capture. Your snap appears here automatically.
        </p>
      </div>
    );
  }
  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {snaps.map((snap) => {
        const isAuthor = !viewerUserId || snap.userId === viewerUserId;
        const isAdmin = !isAuthor && Boolean(viewerIsWorkspaceOwner);
        const authorName = ownerNames?.[snap.userId] ?? null;
        const authorImage = ownerImages?.[snap.userId] ?? null;
        return (
          <SnapCard
            key={snap.id}
            snap={snap}
            canAuthor={isAuthor}
            canAdminister={isAdmin}
            allowPublicLinks={allowPublicLinks}
            authorName={authorName}
            authorImage={authorImage}
          />
        );
      })}
    </div>
  );
}

function SnapCard({
  snap,
  canAuthor,
  canAdminister,
  allowPublicLinks,
  authorName,
  authorImage,
}: {
  snap: DashboardSnapRow;
  canAuthor: boolean;
  canAdminister: boolean;
  allowPublicLinks: boolean;
  authorName?: string | null;
  authorImage?: string | null;
}) {
  const canManage = canAuthor || canAdminister;
  const readOnly = !canAuthor;
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [renaming, startRenameTransition] = useTransition();
  const [title, setTitle] = useState(snap.title ?? '');
  const [renameError, setRenameError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<SnapVisibility>(snap.visibility);
  const [visibilityError, setVisibilityError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const viewUrl = publicSnapViewUrl(snap.id);
  const imageUrl = publicSnapImageUrl(snap);
  const displayTitle = snap.title?.trim() || `Snap ${snap.id}`;
  const authorLabel = authorName ?? 'Unknown';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(viewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable; the visible link remains the fallback.
    }
  };

  const remove = () => {
    if (!confirm('Delete this snap? The public link will stop working.'))
      return;
    startTransition(async () => {
      await deleteSnapAction(snap.id);
    });
  };

  const onRename = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = title.trim();
    setRenameError(null);
    startRenameTransition(async () => {
      const res = await renameSnapAction(snap.id, next);
      if (res.error) {
        setRenameError(res.error);
        return;
      }
      setEditing(false);
    });
  };

  const thumbnailHref = viewUrl;
  const thumbnailTarget = '_blank';
  const thumbnailRel = 'noreferrer';

  return (
    <article className="group overflow-hidden rounded-lg border border-line bg-neutral-900 transition-colors hover:border-line-strong">
      <Link
        href={thumbnailHref}
        target={thumbnailTarget}
        rel={thumbnailRel}
        className="relative block aspect-video overflow-hidden bg-neutral-950"
      >
        <Image
          src={imageUrl}
          alt={displayTitle}
          width={snap.width}
          height={snap.height}
          unoptimized
          className="h-full w-full object-cover"
        />
        <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          {snap.width}×{snap.height}
        </span>

        {/* Eats clicks so the underlying Link doesn't fire. */}
        <div
          className={
            'absolute right-2 top-2 flex items-center gap-1.5 transition-opacity ' +
            (menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')
          }
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? 'Link copied' : 'Copy link'}
            title={copied ? 'Link copied' : 'Copy link'}
            className={
              'flex h-8 w-8 items-center justify-center rounded-md backdrop-blur-md transition-colors ' +
              (copied
                ? 'bg-emerald-500/85 text-white'
                : 'bg-white/80 text-fg ring-1 ring-line-strong hover:bg-white dark:bg-black/55 dark:text-white dark:hover:bg-black/70')
            }
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Link2 className="h-4 w-4" />
            )}
          </button>
          {canManage && (
            <SmoothDropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <SmoothDropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="More actions"
                  title="More actions"
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-white/80 text-fg ring-1 ring-line-strong backdrop-blur-md transition-colors hover:bg-white dark:bg-black/55 dark:text-white dark:hover:bg-black/70"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </SmoothDropdownMenuTrigger>
              <SmoothDropdownMenuContent align="end" sideOffset={6}>
                <SmoothDropdownMenuItem
                  onSelect={() => {
                    window.open(viewUrl, '_blank', 'noreferrer');
                  }}
                >
                  <ExternalLink className="h-4 w-4 text-neutral-500" />
                  Open snap
                </SmoothDropdownMenuItem>
                {canAuthor && (
                  <SmoothDropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setEditing(true);
                    }}
                  >
                    <Pencil className="h-4 w-4 text-neutral-500" />
                    Rename
                  </SmoothDropdownMenuItem>
                )}
                <SmoothDropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    remove();
                  }}
                  disabled={pending}
                  className="text-red-600 focus:bg-red-500/10 focus:text-red-700 dark:text-red-300 dark:focus:text-red-200"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete snap
                </SmoothDropdownMenuItem>
              </SmoothDropdownMenuContent>
            </SmoothDropdownMenu>
          )}
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar className="h-7 w-7">
            {authorImage ? <AvatarImage src={authorImage} alt="" /> : null}
            <AvatarFallback className="text-[11px]" seed={snap.userId}>
              {initials(authorLabel)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col leading-tight">
            <div className="flex min-w-0 items-center gap-1.5 text-sm">
              <span className="truncate font-semibold text-neutral-100">
                {authorLabel}
              </span>
              <span className="shrink-0 text-neutral-600">·</span>
              <span
                suppressHydrationWarning
                className="shrink-0 text-neutral-500"
              >
                {formatRelative(snap.createdAt)}
              </span>
            </div>
            {canManage ? (
              <VisibilityDialog
                value={visibility}
                disabled={pending}
                allowPublic={allowPublicLinks}
                onChange={(next) => {
                  if (next === visibility) return;
                  const previous = visibility;
                  setVisibility(next);
                  setVisibilityError(null);
                  startTransition(async () => {
                    const res = await setSnapVisibilityAction(snap.id, next);
                    if (res.error) {
                      setVisibility(previous);
                      setVisibilityError(res.error);
                    }
                  });
                }}
                trigger={<VisibilityText visibility={visibility} interactive />}
              />
            ) : (
              <VisibilityText visibility={visibility} />
            )}
          </div>
        </div>

        {editing ? (
          <form className="flex items-center gap-1" onSubmit={onRename}>
            <input
              autoFocus
              className="block w-full rounded-md border border-line bg-neutral-950 px-2 py-1 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled snap"
              value={title}
            />
            <button
              type="submit"
              disabled={renaming}
              className="rounded-md bg-white px-2 py-1 text-xs font-medium text-neutral-950 disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setTitle(snap.title ?? '');
                setRenameError(null);
              }}
              className="rounded-md border border-line px-2 py-1 text-xs text-neutral-400 hover:text-neutral-200"
            >
              Cancel
            </button>
          </form>
        ) : (
          <p
            className="line-clamp-2 text-[15px] font-semibold leading-snug text-neutral-50"
            title={displayTitle}
          >
            {displayTitle}
          </p>
        )}

        {renameError && <p className="text-xs text-red-400">{renameError}</p>}
        {visibilityError && (
          <p className="text-xs text-red-400">{visibilityError}</p>
        )}

        <div className="flex items-center justify-between border-t border-line pt-3 text-xs text-neutral-400">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-neutral-500" />
              {snap.viewCount}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-neutral-500" />0
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Smile className="h-4 w-4 text-neutral-500" />0
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-neutral-500">
              {formatBytes(snap.sizeBytes)}
            </span>
            {canAuthor ? (
              <Link
                href={`/snaps/${snap.id}/edit`}
                aria-label="Edit snap"
                title="Edit snap"
                className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-overlay hover:text-neutral-100"
              >
                <Pencil className="h-4 w-4" />
              </Link>
            ) : (
              <span aria-hidden className="h-7 w-7" />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function visibilityLabel(v: SnapVisibility): string {
  if (v === 'public') return 'Public';
  if (v === 'workspace') return 'Workspace';
  return 'Private';
}

const VisibilityText = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    visibility: SnapVisibility;
    interactive?: boolean;
  }
>(function VisibilityText(
  { visibility, interactive, className, ...props },
  ref
) {
  const base =
    'inline-flex items-center gap-1 text-xs leading-none text-neutral-500';
  if (!interactive) {
    return (
      <span className={base + (className ? ` ${className}` : '')}>
        {visibilityLabel(visibility)}
      </span>
    );
  }
  return (
    <button
      ref={ref}
      type="button"
      className={
        base +
        ' cursor-pointer rounded-sm transition-colors hover:text-neutral-200' +
        (className ? ` ${className}` : '')
      }
      {...props}
    >
      {visibilityLabel(visibility)}
      <ChevronDown className="h-3 w-3" />
    </button>
  );
});

