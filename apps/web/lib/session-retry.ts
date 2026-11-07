export const SESSION_RETRY_WINDOW_MS = 60_000;
export const SESSION_RETRIES = 2;

// Reloads already spent on a stalled session in the last minute; past the limit the page shows the error.
export function nextRetries(
  previous: number[],
  now: number,
): { retry: boolean; tries: number[] } {
  const recent = previous.filter(
    (at) => Number.isFinite(at) && now - at < SESSION_RETRY_WINDOW_MS,
  );
  if (recent.length >= SESSION_RETRIES) return { retry: false, tries: recent };
  return { retry: true, tries: [...recent, now] };
}
