const MAX_START_SECONDS = 24 * 3600;

// The `t` of a shared link: whole or fractional seconds into the recording,
// or null for anything else so a mangled link still opens at the start.
export function hydrateStartSeconds(raw: unknown): number | null {
  if (typeof raw !== "string" || !/^\d+(\.\d+)?$/.test(raw)) return null;
  const seconds = Number(raw);
  return seconds > 0 && seconds <= MAX_START_SECONDS ? seconds : null;
}

export function shareUrlAt(url: string, seconds: number): string {
  const whole = Math.floor(seconds);
  if (!(whole >= 1)) return url;
  const target = new URL(url);
  target.searchParams.set("t", String(whole));
  return target.toString();
}
