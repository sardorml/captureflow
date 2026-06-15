// Format a unix-ms timestamp as a Loom-style relative label.
// "just now" → "X minutes ago" → "about X hours ago" → "X days ago"
// → absolute date past 30 days. Single source of truth — both the
// viewer and the editor's posted-by row consume this.
export function timeAgo(ms: number): string {
  const now = Date.now();
  const diff = Math.max(0, now - ms);
  const sec = Math.round(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `about ${hr} hour${hr === 1 ? '' : 's'} ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day} day${day === 1 ? '' : 's'} ago`;
  return new Date(ms).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
