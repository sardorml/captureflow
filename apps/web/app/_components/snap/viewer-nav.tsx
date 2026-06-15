'use client';

// Dark top navbar shared by the share viewer + snap viewer. Wordmark
// on the left (logoSrc + product name), action chips + optional
// signed-in avatar on the right. Spans the full viewport width so the
// chrome reads as application-level, not page-level — matches Loom's
// posture where the toolbar runs edge-to-edge above the content
// region.
//
// Renderered inside its own `<header>` so callers can drop it above
// their `<main>` without worrying about nesting landmarks.
import { useEffect, useState, type ReactElement, type ReactNode } from 'react';
import { Check, Download, Link2 } from 'lucide-react';

export type ViewerNavViewer = {
  name: string | null;
  email: string;
};

export type ViewerNavProps = {
  // Destination the wordmark links to. The share/snap viewers point
  // this at app.captureflow.xyz so signed-in users get one click into
  // their dashboard; anonymous visitors still land on the (login-
  // gated) app shell.
  homeUrl: string;
  // Brand name — used as the logo's alt text. Visible label next to
  // the logo is `label` (falls back to `productName`).
  productName: string;
  // Visible wordmark text. The share viewer passes "Screen recording"
  // and the snap viewer passes "Screenshot" — the bare product name
  // doesn't tell visitors what they're looking at on landing.
  label?: string;
  // Static asset path — both Next apps publish their own
  // /public/logo.png so we don't bundle binaries into the workspace
  // package. Defaults to `/logo.png` which matches the convention.
  logoSrc?: string;
  viewCount?: number;
  // When provided, the navbar renders a download button alongside
  // the copy-link affordance. Omit on routes that have no media.
  downloadUrl?: string;
  downloadName?: string;
  // Optional signed-in viewer. When set, an avatar chip renders on
  // the far right. Anonymous visitors render no chip — they can sign
  // in via the activity sidebar CTA. Suppressed when `userMenu` is
  // provided (consumer takes over the slot).
  viewer?: ViewerNavViewer | null;
  // Custom react node rendered in place of the default avatar chip.
  // The share/snap viewer passes a shadcn DropdownMenu (Dashboard /
  // Workspace settings / Sign out) so the avatar opens a menu
  // instead of navigating away.
  userMenu?: ReactNode;
  // Optional theme toggle node. The share/snap viewer passes the
  // shared `<ThemeToggle initialTheme={...} />` so visitors can flip
  // light/dark inline. Hosted in the package as a slot so the nav
  // doesn't need to import @captureflow/ui directly.
  themeToggle?: ReactNode;
  // When provided, the default action chips (download + copy link)
  // are suppressed and this slot is rendered instead. The share
  // viewer uses this to surface the segmented Share button + the
  // overflow menu (Download / Delete) in their place.
  actions?: ReactNode;
};

export function ViewerNav({
  homeUrl,
  productName,
  label,
  logoSrc = '/logo.png',
  viewCount,
  downloadUrl,
  downloadName,
  viewer,
  actions,
  userMenu,
  themeToggle,
}: ViewerNavProps): ReactElement {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = (): void => {
    if (typeof window === 'undefined') return;
    void navigator.clipboard
      .writeText(window.location.href)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-line bg-canvas-2 px-4 sm:px-6">
      <a
        href={homeUrl}
        rel="noopener noreferrer"
        className="flex items-center gap-2"
      >
        {/* Plain <img> so the package doesn't hardcode a dependency on
            next/image — each consumer hosts its own /logo.png and the
            file size is small enough that <img> is fine. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt={productName}
          width={32}
          height={32}
          className="h-7 w-auto"
        />
        <span className="flex items-baseline gap-1.5 text-xl font-semibold tracking-tight lowercase">
          <span className="text-neutral-100">{productName}</span>
          {label ? (
            <>
              <span aria-hidden className="text-neutral-700">
                |
              </span>
              <span className="text-neutral-400">{label}</span>
            </>
          ) : null}
        </span>
      </a>
      <div className="flex items-center gap-3">
        {typeof viewCount === 'number' ? (
          <span className="text-sm tabular-nums text-neutral-400">
            {viewCount.toLocaleString()} {viewCount === 1 ? 'view' : 'views'}
          </span>
        ) : null}
        {actions ? (
          actions
        ) : (
          <>
            {downloadUrl ? (
              <a
                href={downloadUrl}
                download={downloadName ?? true}
                aria-label="Download"
                title="Download"
                className="flex h-9 w-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-overlay text-sm font-medium text-neutral-300 transition-colors hover:bg-overlay-strong hover:text-fg-strong sm:w-auto sm:px-3"
              >
                <Download className="size-[18px]" />
                <span className="hidden sm:inline">Download</span>
              </a>
            ) : null}
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? 'Link copied' : 'Copy link'}
              title={copied ? 'Link copied' : 'Copy link'}
              className={`flex h-9 w-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors sm:w-auto sm:px-3 ${
                copied
                  ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-overlay text-neutral-300 hover:bg-overlay-strong hover:text-fg-strong'
              }`}
            >
              {copied ? (
                <Check className="size-[18px]" />
              ) : (
                <Link2 className="size-[18px]" />
              )}
              <span className="hidden sm:inline">
                {copied ? 'Copied' : 'Copy link'}
              </span>
            </button>
          </>
        )}
        {themeToggle}
        {userMenu ? (
          userMenu
        ) : viewer ? (
          <span
            title={viewer.name?.trim() || viewer.email}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-neutral-200 ring-1 ring-line-strong"
          >
            {initials(viewer)}
          </span>
        ) : null}
      </div>
    </header>
  );
}

function initials(viewer: ViewerNavViewer): string {
  const source = (viewer.name ?? '').trim() || viewer.email;
  return source
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
