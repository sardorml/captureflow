'use client';

import Link from 'next/link';
import { initials, formatBytes, formatDuration, formatRelativeShort as formatRelative } from '@/lib/format';
import { forwardRef, useState, useTransition } from 'react';
import type React from 'react';
import {
  Check,
  ExternalLink,
  ChevronDown,
  Eye,
  Film,
  Globe,
  Link2,
  Lock,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Smile,
  Trash2,
  Users,
} from 'lucide-react';
import type { DashboardShareRow, ShareVisibility } from '@/lib/shares-db';
import { viewUrlFor } from '@/lib/site';
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
  deleteShareAction,
  renameShareAction,
  setVisibilityAction,
} from './actions';
import { VisibilityDialog } from './VisibilityDialog';

const CDN_BASE_URL =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? 'https://cdn.captureflow.xyz';

type SharesListProps = {
  shares: DashboardShareRow[];
  viewerUserId?: string;
  viewerIsWorkspaceOwner?: boolean;
  allowPublicLinks?: boolean;
  ownerNames?: Record<string, string>;
  ownerImages?: Record<string, string>;
};

export function SharesList({
  shares,
  viewerUserId,
  viewerIsWorkspaceOwner,
  allowPublicLinks = true,
  ownerNames,
  ownerImages,
}: SharesListProps) {
  if (shares.length === 0) {
    return (
      <p className="mt-4 rounded-2xl border border-dashed border-line bg-neutral-900/40 px-4 py-12 text-center text-sm text-neutral-500">
        You haven&apos;t created any share links yet. Record in the CaptureFlow
        desktop app and your shares will show up here.
      </p>
    );
  }
  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {shares.map((s) => {
        const isAuthor = !viewerUserId || s.userId === viewerUserId;
        const isAdmin = !isAuthor && Boolean(viewerIsWorkspaceOwner);
        const authorName = ownerNames?.[s.userId] ?? null;
        const authorImage = ownerImages?.[s.userId] ?? null;
        return (
          <ShareCard
            key={s.slug}
            share={s}
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

type ShareCardProps = {
  share: DashboardShareRow;
  canAuthor: boolean;
  canAdminister: boolean;
  allowPublicLinks: boolean;
  authorName?: string | null;
  authorImage?: string | null;
};

function ShareCard({
  share,
  canAuthor,
  canAdminister,
  allowPublicLinks,
  authorName,
  authorImage,
}: ShareCardProps) {
  const canManage = canAuthor || canAdminister;
  const readOnly = !canAuthor;
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(share.title ?? '');
  const [visibility, setVisibility] = useState<ShareVisibility>(
    share.visibility
  );
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const shareUrl = viewUrlFor(share.slug);
  const posterUrl = share.posterKey
    ? `${CDN_BASE_URL}/${share.posterKey}`
    : null;
  const videoThumbUrl =
    share.state === 'ready' && !posterUrl
      ? `${CDN_BASE_URL}/${share.storageKey}?v=${share.sizeBytes}`
      : null;
  const thumbnailHref = shareUrl;
  const thumbnailTarget = '_blank';
  const thumbnailRel = 'noreferrer';

  const onRename = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await renameShareAction({ error: null, slug: null }, form);
      if (res.error) {
        setError(res.error);
        return;
      }
      setEditing(false);
    });
  };

  const onChangeVisibility = (next: ShareVisibility) => {
    if (next === visibility) return;
    const previous = visibility;
    setVisibility(next);
    setError(null);
    startTransition(async () => {
      const res = await setVisibilityAction(share.slug, next);
      if (res.error) {
        setVisibility(previous);
        setError(res.error);
      }
    });
  };

  const onDelete = () => {
    const ok = confirm(
      `Delete this share permanently? The video and link will stop working immediately.`
    );
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteShareAction(share.slug);
      if (res.error) setError(res.error);
    });
  };

  const onCopyLink = () => {
    if (typeof window === 'undefined') return;
    void navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => setCopied(false));
  };

  const displayTitle = share.title?.trim() || 'Untitled share';
  const authorLabel = authorName ?? 'Unknown';

  return (
    <article className="group overflow-hidden rounded-lg border border-line bg-neutral-900 transition-colors hover:border-line-strong">
      <Link
        aria-label={readOnly ? 'Open share' : 'Edit share'}
        className="relative block aspect-video overflow-hidden bg-neutral-950"
        href={thumbnailHref}
        target={thumbnailTarget}
        rel={thumbnailRel}
      >
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="h-full w-full object-cover"
            decoding="async"
            loading="lazy"
            src={posterUrl}
          />
        ) : videoThumbUrl ? (
          <video
            className="pointer-events-none h-full w-full object-cover"
            src={videoThumbUrl}
            preload="metadata"
            muted
            playsInline
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-neutral-600">
            <Film className="h-6 w-6" />
          </span>
        )}
        {share.durationMs != null && (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {formatDuration(share.durationMs)}
          </span>
        )}
        {share.state !== 'ready' && (
          <span className="absolute left-2 top-2 rounded-md bg-amber-500/90 px-2 py-0.5 text-[11px] font-medium text-amber-950">
            {share.state}
          </span>
        )}

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
            onClick={onCopyLink}
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
                    window.open(shareUrl, '_blank', 'noreferrer');
                  }}
                >
                  <ExternalLink className="h-4 w-4 text-neutral-500" />
                  Open share
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
                    onDelete();
                  }}
                  disabled={pending}
                  className="text-red-600 focus:bg-red-500/10 focus:text-red-700 dark:text-red-300 dark:focus:text-red-200"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete share
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
            <AvatarFallback className="text-[11px]" seed={share.userId}>
              {initials(authorLabel)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col leading-tight">
            <div className="flex min-w-0 items-center gap-1.5 text-sm">
              <span className="truncate font-semibold text-neutral-100">
                {authorLabel}
              </span>
              <span className="shrink-0 text-neutral-600">·</span>
              <span className="shrink-0 text-neutral-500">
                {formatRelative(share.createdAt)}
              </span>
            </div>
            {canManage ? (
              <VisibilityDialog
                value={visibility}
                disabled={pending}
                onChange={onChangeVisibility}
                allowPublic={allowPublicLinks}
                trigger={<VisibilityText visibility={visibility} interactive />}
              />
            ) : (
              <VisibilityText visibility={visibility} />
            )}
          </div>
        </div>

        {editing ? (
          <form className="flex items-center gap-2" onSubmit={onRename}>
            <input type="hidden" name="slug" value={share.slug} />
            <input
              autoFocus
              className="block w-full rounded-md border border-line bg-neutral-950 px-2 py-1 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              maxLength={200}
              name="title"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled share"
              value={title}
            />
            <button
              className="rounded-md bg-white px-2 py-1 text-xs font-medium text-neutral-950 disabled:opacity-60"
              disabled={pending}
              type="submit"
            >
              Save
            </button>
            <button
              className="rounded-md border border-line px-2 py-1 text-xs text-neutral-400 hover:text-neutral-200"
              onClick={() => {
                setEditing(false);
                setTitle(share.title ?? '');
                setError(null);
              }}
              type="button"
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

        <div className="flex items-center justify-between border-t border-line pt-3 text-xs text-neutral-400">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-neutral-500" />
              {share.viewCount}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-neutral-500" />
              {share.commentCount}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Smile className="h-4 w-4 text-neutral-500" />
              {share.reactionCount}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden whitespace-nowrap text-fg-muted sm:inline lg:hidden 2xl:inline">
              {formatBytes(share.sizeBytes)}
            </span>
            {canAuthor ? (
              <Link
                href={`/shares/${share.slug}/edit`}
                aria-label="Edit recording"
                title="Edit recording"
                className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-overlay hover:text-neutral-100"
              >
                <Pencil className="h-4 w-4" />
              </Link>
            ) : (
              <span aria-hidden className="h-7 w-7" />
            )}
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </article>
  );
}

function visibilityLabel(v: ShareVisibility): string {
  if (v === 'public') return 'Public';
  if (v === 'workspace') return 'Workspace';
  return 'Private';
}

const VisibilityText = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    visibility: ShareVisibility;
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

