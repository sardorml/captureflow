/*
 * Sign-in stores the avatar at the 96px the provider hands out, which smears
 * across a 220px bubble. Google's image host sizes on request through the
 * trailing `=s<px>-c`, so the bubble asks for its own pixel size; any other
 * host is used as stored.
 */
export function avatarUrlAt(url: string, size: number): string {
  const px = Math.max(1, Math.round(size));
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith(".googleusercontent.com")) return url;
    return url.replace(/=s\d+(-c)?$/, `=s${px}-c`);
  } catch {
    return url;
  }
}
