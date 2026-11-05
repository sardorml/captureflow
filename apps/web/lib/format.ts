import { formatDate, relativeTime } from "@/lib/i18n/intl";

/* Shared formatting helpers. Consolidated from per-file copies that had drifted
 * (e.g. a chapter timestamp that dropped the h:mm:ss branch). Keep these pure
 * and side-effect-free so they're trivially testable. */

type RelativeUnit = Parameters<ReturnType<typeof relativeTime>>[1];

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
/*
 * English keeps its compact form ("5m ago"); any other language gets its own
 * short wording for the same step.
 */
export function formatRelativeShort(ts: number, lang = "en"): string {
  const relative = /^en\b/.test(lang) ? null : relativeTime(lang, "short");
  const ago = (count: number, unit: RelativeUnit, short: string) =>
    relative ? relative(-count, unit) : `${count}${short} ago`;

  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return relative ? relative(0, "second") : "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return ago(min, "minute", "m");
  const hr = Math.floor(min / 60);
  if (hr < 24) return ago(hr, "hour", "h");
  const day = Math.floor(hr / 24);
  if (day < 30) return ago(day, "day", "d");
  const mo = Math.floor(day / 30);
  if (mo < 12) return ago(mo, "month", "mo");
  return ago(Math.floor(day / 365), "year", "y");
}

/** Verbose relative time, e.g. "5 minutes ago", "about 2 hours ago", "1 week ago". */
// English keeps its own wording; any other language gets its own.
export function formatRelativeLong(epochMs: number, lang = "en"): string {
  const relative = /^en\b/.test(lang) ? null : relativeTime(lang, "long");
  const ago = (count: number, unit: RelativeUnit, english: string) =>
    relative ? relative(-count, unit) : english;
  const now = relative ? relative(0, "second") : "just now";

  const diff = Date.now() - epochMs;
  if (diff < 0) return now;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return now;
  const min = Math.floor(sec / 60);
  if (min < 60)
    return ago(
      min,
      "minute",
      min === 1 ? "1 minute ago" : `${min} minutes ago`,
    );
  const hr = Math.floor(min / 60);
  if (hr < 24)
    return ago(
      hr,
      "hour",
      hr === 1 ? "about 1 hour ago" : `about ${hr} hours ago`,
    );
  const day = Math.floor(hr / 24);
  if (day < 7)
    return ago(day, "day", day === 1 ? "1 day ago" : `${day} days ago`);
  const week = Math.floor(day / 7);
  if (week < 5)
    return ago(week, "week", week === 1 ? "1 week ago" : `${week} weeks ago`);
  const month = Math.floor(day / 30);
  if (month < 12)
    return ago(
      month,
      "month",
      month === 1 ? "1 month ago" : `${month} months ago`,
    );
  const year = Math.floor(day / 365);
  return ago(year, "year", year === 1 ? "1 year ago" : `${year} years ago`);
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

/*
 * When something was posted, for a card: "Today at 2:14 PM", "Yesterday at
 * 9:03 AM", "Oct 26 at 4:40 PM", or "Oct 26, 2025" from an earlier year.
 * Locale and zone are the viewer's unless given. `lang` is the app's language:
 * English keeps that wording, any other language gets the browser's.
 */
export function formatPostedAt(
  ms: number,
  now: number = Date.now(),
  opts: { locale?: string; timeZone?: string; lang?: string } = {},
): string {
  const { timeZone, lang = "en" } = opts;
  const english = /^en\b/.test(lang);
  const day = (t: number) =>
    new Date(t).toLocaleDateString("en-CA", { timeZone });
  const time = formatDate(
    ms,
    lang,
    { hour: "numeric", minute: "2-digit", timeZone },
    opts.locale,
  );
  const dayWord = (offset: number, word: string) => {
    if (english) return `${word} at ${time}`;
    const named = relativeTime(lang, "long")(offset, "day");
    return `${named.charAt(0).toLocaleUpperCase(lang)}${named.slice(1)}, ${time}`;
  };
  if (day(ms) === day(now)) return dayWord(0, "Today");
  if (day(ms) === day(now - 86_400_000)) return dayWord(-1, "Yesterday");
  const sameYear =
    new Date(ms).toLocaleDateString("en-CA", { year: "numeric", timeZone }) ===
    new Date(now).toLocaleDateString("en-CA", { year: "numeric", timeZone });
  const date = formatDate(
    ms,
    lang,
    {
      month: "short",
      day: "numeric",
      year: sameYear ? undefined : "numeric",
      timeZone,
    },
    opts.locale,
  );
  if (!sameYear) return date;
  return english ? `${date} at ${time}` : `${date}, ${time}`;
}
