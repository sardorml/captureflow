'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  Link2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from 'lucide-react';
import {
  ReadonlyVisibilityRow,
  SmoothButton,
  SmoothDialog,
  SmoothDialogContent,
  SmoothDialogTitle,
  SmoothDropdownMenu,
  SmoothDropdownMenuContent,
  SmoothDropdownMenuItem,
  SmoothDropdownMenuTrigger,
  VisibilityPicker,
} from '@captureflow/ui';
import type { ShareVisibility } from '@/lib/share/types';

// Loom-style action cluster for the share viewer's top-right corner.
// Segmented Share/link button on the left, overflow menu on the right.
// The Share button opens a modal with visibility controls (owner) +
// copy link; the overflow holds Download and (owner-only) Delete.

type Props = {
  slug: string;
  shareUrl: string;
  // Dashboard editor URL on app.captureflow.xyz. Renders an Edit
  // chip left of the Share button for owners; non-owners can't edit
  // so the chip is suppressed.
  editUrl: string;
  initialVisibility: ShareVisibility;
  // Owner of the share — gates the destructive actions + visibility
  // selector. Anonymous + non-owner viewers see a simplified menu
  // (Download only) and a read-only visibility row in the modal.
  isOwner: boolean;
  // Workspace name shown in the visibility section ("Anyone in
  // {workspaceName}") when the workspace option is offered. Null
  // when the share has no workspace (legacy anonymous uploads).
  workspaceName: string | null;
  // Workspace policy: when false, the Public visibility option is
  // hidden so the owner can't bypass the workspace's link policy
  // from the viewer page.
  allowPublicLinks: boolean;
  // Signed-in flag. Anonymous viewers only see Copy link — the Share
  // dialog needs an account to attribute reactions/comments, so we
  // don't surface it for logged-out visitors.
  signedIn: boolean;
};

export function ShareActions({
  slug,
  shareUrl,
  editUrl,
  initialVisibility,
  isOwner,
  workspaceName,
  allowPublicLinks,
  signedIn,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visibility, setVisibility] =
    useState<ShareVisibility>(initialVisibility);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const copyLink = () => {
    if (typeof window === 'undefined') return;
    void navigator.clipboard
      .writeText(shareUrl)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };

  const changeVisibility = (next: ShareVisibility) => {
    if (next === visibility || !isOwner) return;
    const previous = visibility;
    setVisibility(next);
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/r/visibility?slug=${encodeURIComponent(slug)}`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ value: next }),
          }
        );
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
      } catch (err) {
        setVisibility(previous);
        setError(
          err instanceof Error ? err.message : 'Could not update visibility'
        );
      }
    });
  };

  const onDelete = () => {
    if (!isOwner) return;
    const ok = confirm(
      'Delete this share permanently? The video and link will stop working immediately.'
    );
    if (!ok) return;
    setError(null);
    startDelete(async () => {
      try {
        const res = await fetch(`/api/r/${encodeURIComponent(slug)}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // Bounce to marketing — the share row + R2 objects are gone.
        router.replace('/');
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Could not delete the share'
        );
      }
    });
  };

  // Workspace visibility only makes sense when the share has a
  // workspace; legacy anonymous uploads (no userId/workspaceId)
  // shouldn't see the option.
  const showWorkspace = !!workspaceName;
  const showPublic = allowPublicLinks || visibility === 'public';

  return (
    <>
      <div className="flex items-center gap-2">
        {isOwner && (
          <a
            href={editUrl}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-overlay px-3 text-sm font-medium text-fg transition-colors hover:bg-overlay-strong hover:text-fg-strong"
          >
            <Pencil className="size-[16px]" />
            <span className="hidden sm:inline">Edit recording</span>
          </a>
        )}
        {signedIn ? (
          <div className="flex h-9 items-stretch overflow-hidden rounded-lg bg-blue-600">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              <Users className="size-[18px]" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <span aria-hidden className="w-px bg-blue-700/60" />
            <button
              type="button"
              onClick={copyLink}
              aria-label={copied ? 'Link copied' : 'Copy link'}
              title={copied ? 'Link copied' : 'Copy link'}
              className="flex items-center justify-center px-3 text-white transition-colors hover:bg-blue-500"
            >
              {copied ? (
                <Check className="size-[18px]" />
              ) : (
                <Link2 className="size-[18px]" />
              )}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={copyLink}
            aria-label={copied ? 'Link copied' : 'Copy link'}
            title={copied ? 'Link copied' : 'Copy link'}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-overlay px-3 text-sm font-medium text-fg transition-colors hover:bg-overlay-strong hover:text-fg-strong"
          >
            {copied ? (
              <Check className="size-[16px]" />
            ) : (
              <Link2 className="size-[16px]" />
            )}
            <span className="hidden sm:inline">
              {copied ? 'Copied' : 'Copy link'}
            </span>
          </button>
        )}

        {isOwner && (
          <SmoothDropdownMenu>
            <SmoothDropdownMenuTrigger asChild>
              <SmoothButton
                variant="ghost"
                size="icon"
                aria-label="More actions"
                title="More actions"
                className="h-9 w-9"
              >
                <MoreHorizontal className="size-[18px]" />
              </SmoothButton>
            </SmoothDropdownMenuTrigger>
            <SmoothDropdownMenuContent align="end" sideOffset={6}>
              <SmoothDropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  onDelete();
                }}
                disabled={deleting}
                className="text-red-600 focus:bg-red-500/10 focus:text-red-700 dark:text-red-300 dark:focus:text-red-200"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? 'Deleting…' : 'Delete share'}
              </SmoothDropdownMenuItem>
            </SmoothDropdownMenuContent>
          </SmoothDropdownMenu>
        )}
      </div>

      <SmoothDialog open={open} onOpenChange={setOpen}>
        <SmoothDialogContent className="sm:max-w-md">
          <SmoothDialogTitle>Share recording</SmoothDialogTitle>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
                General access
              </p>
              <div className="mt-2">
                {isOwner ? (
                  <VisibilityPicker
                    value={visibility}
                    onChange={changeVisibility}
                    showPublic={showPublic}
                    showWorkspace={showWorkspace}
                    workspaceName={workspaceName}
                    disabled={pending}
                  />
                ) : (
                  <div className="rounded-lg border border-line-strong bg-canvas-2 p-3">
                    <ReadonlyVisibilityRow value={visibility} />
                  </div>
                )}
              </div>
              {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-line-strong pt-4">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-fg-muted transition-colors hover:bg-overlay hover:text-fg"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  Link copied
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4" />
                  Copy link
                </>
              )}
            </button>
            <SmoothButton type="button" onClick={() => setOpen(false)}>
              Done
            </SmoothButton>
          </div>
        </SmoothDialogContent>
      </SmoothDialog>
    </>
  );
}
