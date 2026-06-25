export const SITE_URL =
  process.env.NEXT_PUBLIC_MARKETING_SITE_URL ?? "https://captureflow.xyz";

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
    ? "https://docs.captureflow.xyz"
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
  process.env.R2_PUBLIC_BASE_URL ?? "https://cdn.captureflow.xyz";

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
