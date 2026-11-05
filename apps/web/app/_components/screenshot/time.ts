import { formatDate, relativeTime } from "@/lib/i18n/intl";

// English keeps its own wording; any other language gets its own.
export function timeAgo(ms: number, lang = "en"): string {
  const relative = /^en\b/.test(lang) ? null : relativeTime(lang, "long");
  const now = Date.now();
  const diff = Math.max(0, now - ms);
  const sec = Math.round(diff / 1000);
  if (sec < 60) return relative ? relative(0, "second") : "just now";
  const min = Math.round(sec / 60);
  if (min < 60)
    return relative
      ? relative(-min, "minute")
      : `${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.round(min / 60);
  if (hr < 24)
    return relative
      ? relative(-hr, "hour")
      : `about ${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.round(hr / 24);
  if (day < 30)
    return relative
      ? relative(-day, "day")
      : `${day} day${day === 1 ? "" : "s"} ago`;
  return formatDate(ms, lang, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
