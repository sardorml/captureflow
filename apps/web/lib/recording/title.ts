import { PRODUCT_NAME } from "../site";

const UNTITLED = `${PRODUCT_NAME} recording`;

const TITLE_MAX_CHARS = 200;

function formatDateLabel(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Clipped to TITLE_MAX_CHARS so a hostile / extra-long window name can't
// bloat the D1 column.
export function buildRecordingHeadline(
  sourceTitle: string | null,
  createdAt: number,
): string {
  const joined = `${sourceTitle ?? UNTITLED} — ${formatDateLabel(createdAt)}`;
  return joined.slice(0, TITLE_MAX_CHARS);
}

export function sanitizeSourceTitle(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, TITLE_MAX_CHARS);
}

const TRAILING_DATE = / — [A-Z][a-z]+ \d{1,2}, \d{4}$/;

// A share card names what was recorded; the date only crowds it, unless there
// is nothing else to tell recordings apart.
export function shareTitle(title: string): string {
  const named = title.replace(TRAILING_DATE, "");
  return named === UNTITLED ? title : named;
}
