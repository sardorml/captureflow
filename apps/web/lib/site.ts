export const SITE_URL =
  process.env.NEXT_PUBLIC_MARKETING_SITE_URL ?? "https://captureflow.dev";

export const RECORDING_SITE_URL = SITE_URL;
export const MARKETING_SITE_URL = SITE_URL;

export const APP_WEB_SITE_URL =
  process.env.NEXT_PUBLIC_APP_WEB_SITE_URL ?? SITE_URL;

export const PRODUCT_NAME = "CaptureFlow";

// Surfaced as the AGPL-3.0 §7(b) attribution link in the public viewers —
// downstream operators must preserve it.
export const SOURCE_REPO_URL = "https://github.com/sardorml/captureflow";

// Dev docs server is pinned to port 3033 in apps/docs/package.json.
export const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://docs.captureflow.dev"
    : "http://localhost:3033");

export const RELEASES_URL = `${SOURCE_REPO_URL}/releases`;

export const DOWNLOAD_URL =
  process.env.NEXT_PUBLIC_DOWNLOAD_URL ?? `${SOURCE_REPO_URL}/releases/latest`;

export function viewUrlFor(id: string): string {
  return `${SITE_URL}/r/${id}`;
}

export function viewUrlForRequest(req: Request, id: string): string {
  try {
    const origin = new URL(req.url).origin;
    return `${origin}/r/${id}`;
  } catch {
    return viewUrlFor(id);
  }
}

export const SCREENSHOT_SITE_URL = SITE_URL;

export const APP_SITE_URL = APP_WEB_SITE_URL;

export const R2_PUBLIC_BASE_URL =
  process.env.R2_PUBLIC_BASE_URL ?? "https://cdn.captureflow.dev";

/*
 * The unprefixed var above is server-only; client bundles see just this one.
 * Server code that runs inside a request reads the binding env first — the
 * var is request-scoped there — and falls back to this.
 */
export const CDN_BASE_URL =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? R2_PUBLIC_BASE_URL;

// Versioned by the workspace's own updated_at: the key is stable across
// replacements, so without it a new logo keeps serving the cached old one.
export function workspaceLogoUrl(
  logoKey: string | null,
  updatedAt: number,
): string | null {
  return logoKey ? `${CDN_BASE_URL}/${logoKey}?v=${updatedAt}` : null;
}

export function screenshotViewUrlFor(id: string): string {
  return `${SITE_URL}/s/${id}`;
}

export function screenshotEditUrlFor(id: string): string {
  return `${APP_WEB_SITE_URL}/screenshots/${id}/edit`;
}

export function screenshotViewUrlForRequest(req: Request, id: string): string {
  try {
    const origin = new URL(req.url).origin;
    return `${origin}/s/${id}`;
  } catch {
    return screenshotViewUrlFor(id);
  }
}
