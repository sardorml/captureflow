import { PRODUCT_NAME } from '@/lib/site';

const SNAP_BRAND_LINE = `${PRODUCT_NAME} | Free Screen & Video Recording for macOS`;

const TITLE_MAX_CHARS = 200;

function formatDateLabel(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

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
