import { PRODUCT_NAME } from '../site';

// Brand suffix baked into the full headline stored in `shares.title` at
// insert time, so dashboard renames can edit the whole string (brand +
// date included) and the title field is the single source of truth — the
// renderer composes nothing.
const SHARE_BRAND_LINE = `${PRODUCT_NAME} | Free Screen & Video Recording for macOS`;

const TITLE_MAX_CHARS = 200;

function formatDateLabel(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Builds the headline. `sourceTitle` is the variable bit the desktop
// client sends (window owner name or display label); when absent, the
// leading segment is dropped.
//
// Examples:
//   sourceTitle='Brave Browser'  → 'Brave Browser — CaptureFlow | Free Screen & Video Recording for macOS — May 11, 2026'
//   sourceTitle=null             → 'CaptureFlow | Free Screen & Video Recording for macOS — May 11, 2026'
//
// Clipped to TITLE_MAX_CHARS so a hostile / extra-long window name can't
// bloat the D1 column.
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

// Trims and clips a caller-supplied title to TITLE_MAX_CHARS. Returns
// null for non-strings / empty input so callers can treat "no title"
// uniformly.
export function sanitizeSourceTitle(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, TITLE_MAX_CHARS);
}
