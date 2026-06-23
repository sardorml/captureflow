/* Shared formatting helpers. Consolidated from per-file copies that had drifted
 * (e.g. a chapter timestamp that dropped the h:mm:ss branch). Keep these pure
 * and side-effect-free so they're trivially testable. */

const pad = (n: number) => n.toString().padStart(2, "0");

/** Human-readable byte size, e.g. 1536 -> "1.5 KB", 0 -> "0 B". */
export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Duration as m:ss, e.g. 65000 -> "1:05". */
export function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${pad(s)}`;
}

/** Media timestamp as m:ss, or h:mm:ss past an hour, e.g. 4530000 -> "1:15:30". */
export function formatTimestamp(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

/** Compact relative time, e.g. "5m ago", "2h ago", "3d ago", "1y ago". */
export function formatRelativeShort(ts: number): string {
  const diffMs = Date.now() - ts;
  if (diffMs < 0) return "just now";
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  const yr = Math.floor(day / 365);
  return `${yr}y ago`;
}

/** Verbose relative time, e.g. "5 minutes ago", "about 2 hours ago", "1 week ago". */
export function formatRelativeLong(epochMs: number): string {
  const diff = Date.now() - epochMs;
  if (diff < 0) return "just now";
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return min === 1 ? "1 minute ago" : `${min} minutes ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr === 1 ? "about 1 hour ago" : `about ${hr} hours ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return day === 1 ? "1 day ago" : `${day} days ago`;
  const week = Math.floor(day / 7);
  if (week < 5) return week === 1 ? "1 week ago" : `${week} weeks ago`;
  const month = Math.floor(day / 30);
  if (month < 12) return month === 1 ? "1 month ago" : `${month} months ago`;
  const year = Math.floor(day / 365);
  return year === 1 ? "1 year ago" : `${year} years ago`;
}

/** Up to two uppercase initials from a name/source string, "?" when empty. */
export function initials(source: string): string {
  const trimmed = source.trim();
  if (!trimmed) return "?";
  return trimmed
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
