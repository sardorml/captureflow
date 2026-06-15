// Top navbar shared by the snap viewer + (optionally) the snap
// editor. Left side carries the brand chip, snap title, and a
// time-ago line; the trailing `right` slot lets callers drop their
// own action mix (copy-link, save, undo/redo, etc.) without
// re-implementing the chrome. The owner identity strip slots in
// between actions and the brand on the right side via
// `postedByName`/`postedByEmail` props — pass nulls to omit it.
import type { ReactElement, ReactNode } from 'react';
import { CaptureFlowMark } from './captureflow-mark';
import { PostedBy } from './posted-by';
import { timeAgo } from './time';

export type SnapNavbarProps = {
  // App-level title for the brand-link aria-label and logo wrapper.
  // Defaults to "CaptureFlow"; the chip itself shows the
  // CaptureFlowMark glyph regardless.
  brandLabel?: string;
  // Where the brand chip points. Same external marketing site
  // across services — set to "/" or "#" if you want to keep the
  // navigation in-app.
  brandHref?: string;
  // Snap-specific row content.
  title: string;
  createdAt: number;
  // Identity strip on the right, before any custom actions. Pass
  // both as null to hide.
  postedByName?: string | null;
  postedByEmail?: string | null;
  // Caller-supplied right-side action area (typically a
  // CopyLinkButton or a Save button). Rendered between the title
  // row and the PostedBy strip.
  right?: ReactNode;
  className?: string;
};

export function SnapNavbar({
  brandLabel = 'CaptureFlow',
  brandHref = '/',
  title,
  createdAt,
  postedByName = null,
  postedByEmail = null,
  right,
  className = '',
}: SnapNavbarProps): ReactElement {
  const showPostedBy = postedByName !== null || postedByEmail !== null;
  return (
    <header
      className={`flex items-center gap-4 border-b border-neutral-200 bg-white px-6 py-3 ${className}`}
    >
      <a
        href={brandHref}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 transition-colors hover:bg-blue-500/25"
        aria-label={brandLabel}
      >
        <CaptureFlowMark />
      </a>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold tracking-tight text-neutral-900">
          {title}
        </h1>
        <p className="text-xs text-neutral-500">{timeAgo(createdAt)}</p>
      </div>
      {right}
      {showPostedBy && <PostedBy name={postedByName} email={postedByEmail} />}
    </header>
  );
}
