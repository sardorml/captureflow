import { PRODUCT_NAME } from '@/lib/site';

// Shared brand suffix for snap-page headlines. Mirrors the share
// service's `buildShareHeadline` so a snap's public title reads the
// same Loom-style way as a share. Stored in the `snaps.title` column
// at insert time — dashboard renames overwrite the whole string so
// the title field stays the single source of truth (renderer never
// composes anything at draw time).

const SNAP_BRAND_LINE = `${PRODUCT_NAME} | Free Screen & Video Recording for macOS`;

const TITLE_MAX_CHARS = 200;

function formatDateLabel(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// `sourceTitle` is the variable bit the desktop sends — a display
// label (`Built-in Retina Display`), a window owner (`Brave`), or
// an area dimension (`Area · 1280×720`). Absent → drops the leading
// segment so the headline still reads cleanly.
export function buildSnapHeadline(
  sourceTitle: string | null,
  createdAt: number
): string {
  const date = formatDateLabel(createdAt);
  const parts = sourceTitle
    ? [sourceTitle, SNAP_BRAND_LINE, date]
    : [SNAP_BRAND_LINE, date];
  const joined = parts.join(' — ');
  return joined.length > TITLE_MAX_CHARS
    ? joined.slice(0, TITLE_MAX_CHARS)
    : joined;
}

export function sanitizeSourceTitle(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, TITLE_MAX_CHARS);
}
