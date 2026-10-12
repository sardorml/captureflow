import { getAppWebEnv } from "@/lib/cf-env";
import { sealMediaLink } from "@/lib/media-link";
import { publicUrlFor } from "./r2";

/*
 * Where a viewer fetches a recording's media. Public media comes from the CDN;
 * anything else gets an expiring link (/api/r/m/<token>) minted for this page
 * view, so going private or leaving a workspace actually cuts access.
 * Callers must have checked the viewer with canViewResource first.
 */
export async function viewerMediaUrl(
  row: { visibility: string },
  storageKey: string,
): Promise<string> {
  if (row.visibility === "public") return publicUrlFor(storageKey);
  const env = await getAppWebEnv();
  if (!env?.BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET is required to link private media");
  }
  return `/api/r/m/${await sealMediaLink(env.BETTER_AUTH_SECRET, storageKey)}`;
}

// Opaque, so a storage key can't be derived from the share link.
export function newStorageId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export function withVersion(url: string, version: number): string {
  if (!Number.isFinite(version) || version <= 0) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${version}`;
}

export function posterMimeOf(posterKey: string | null): string {
  if (!posterKey) return "image/jpeg";
  const lower = posterKey.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}
