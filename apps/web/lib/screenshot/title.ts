import { PRODUCT_NAME } from "@/lib/site";

const UNTITLED = `${PRODUCT_NAME} screenshot`;

const TITLE_MAX_CHARS = 200;

function formatDateLabel(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function buildScreenshotHeadline(
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
