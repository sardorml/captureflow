import { PRODUCT_NAME } from '../site';

// Shared brand suffix for share-page headlines. Used to build the
// full string stored in `shares.title` at insert time so dashboard
// renames (admin + user) can edit the entire headline — including
// the brand + date bits the renderer used to append at draw time.
// Storing the formatted string means the title field is the single
// source of truth; the renderer no longer composes anything.
const SHARE_BRAND_LINE = `${PRODUCT_NAME} | Free Screen & Video Recording for macOS`;

const TITLE_MAX_CHARS = 200;

function formatDateLabel(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Builds the Loom-style headline. `sourceTitle` is the variable bit
// the desktop client sends (window owner name or display label);
// when absent, the headline drops the leading segment.
//
// Examples:
//   sourceTitle='Brave Browser'  → 'Brave Browser — CaptureFlow | Free Screen & Video Recording for macOS — May 11, 2026'
//   sourceTitle=null             → 'CaptureFlow | Free Screen & Video Recording for macOS — May 11, 2026'
//
// Clipped to TITLE_MAX_CHARS so a hostile / extra-long window name
// can't push the row past D1's column ergonomics.
export function buildShareHeadline(
  sourceTitle: string | null,
  createdAt: number
): string {
  const date = formatDateLabel(createdAt);
  const parts = sourceTitle
    ? [sourceTitle, SHARE_BRAND_LINE, date]
    : [SHARE_BRAND_LINE, date];
  const joined = parts.join(' — ');
  return joined.length > TITLE_MAX_CHARS
    ? joined.slice(0, TITLE_MAX_CHARS)
    : joined;
}

// Trims and length-clips a raw caller-supplied title to the same
// 200-char ceiling. Returns null for non-strings / empty input so
// the build helper above (or the API caller) can treat "no title"
// uniformly.
export function sanitizeSourceTitle(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, TITLE_MAX_CHARS);
}
