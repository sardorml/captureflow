// Site-level URL helpers. Every surface (landing, dashboard, and the
// public share `/r` and snap `/s` viewers) lives on a single host.

// `NEXT_PUBLIC_MARKETING_SITE_URL` is set in wrangler.jsonc [vars];
// fallback is the production root host.
export const SITE_URL =
  process.env.NEXT_PUBLIC_MARKETING_SITE_URL ?? 'https://captureflow.xyz';

// Aliases for readability at call sites; all resolve to the root host.
export const SHARE_SITE_URL = SITE_URL;
export const MARKETING_SITE_URL = SITE_URL;

export const APP_WEB_SITE_URL =
  process.env.NEXT_PUBLIC_APP_WEB_SITE_URL ?? SITE_URL;

export const PRODUCT_NAME = 'CaptureFlow';

// Open-source repository (the Corresponding Source). Surfaced as the
// AGPL-3.0 §7(b) attribution link in the public viewers — downstream
// operators must preserve it.
export const SOURCE_REPO_URL = 'https://github.com/sardorml/captureflow';

// Documentation site (apps/docs). Dev points at the local docs server,
// pinned to port 3033 in apps/docs/package.json. Override with
// NEXT_PUBLIC_DOCS_URL.
export const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL ??
  (process.env.NODE_ENV === 'production'
    ? 'https://docs.captureflow.xyz'
    : 'http://localhost:3033');

// GitHub releases — desktop builds ship here, and electron-updater
// pulls updates from the same place.
export const RELEASES_URL = `${SOURCE_REPO_URL}/releases`;

// Direct desktop-app download. Defaults to the latest GitHub release;
// override with NEXT_PUBLIC_DOWNLOAD_URL for a CDN-hosted .dmg.
export const DOWNLOAD_URL =
  process.env.NEXT_PUBLIC_DOWNLOAD_URL ?? `${SOURCE_REPO_URL}/releases/latest`;

// Public viewer URL for a share; id is the share's public slug.
export function viewUrlFor(id: string): string {
  return `${SITE_URL}/r/${id}`;
}

// Build a viewer URL from the request origin instead of the hard-coded
// SITE_URL, so a desktop app hitting a local dev instance gets a link
// back to that same instance (not prod, where the id doesn't exist).
// Falls back to viewUrlFor() if the request URL can't be parsed.
export function viewUrlForRequest(req: Request, id: string): string {
  try {
    const origin = new URL(req.url).origin;
    return `${origin}/r/${id}`;
  } catch {
    return viewUrlFor(id);
  }
}

// Snap helpers. The snap viewer is served under `/s` on the root host;
// the editor is the app's own `/snaps/<id>/edit` route on the same host.

export const SNAP_SITE_URL = SITE_URL;

// Host for the editor + login (app-web).
export const APP_SITE_URL = APP_WEB_SITE_URL;

// CDN origin for direct R2 reads of snap PNGs.
export const R2_PUBLIC_BASE_URL =
  process.env.R2_PUBLIC_BASE_URL ?? 'https://cdn.captureflow.xyz';

// Public viewer URL for a snap.
export function snapViewUrlFor(id: string): string {
  return `${SITE_URL}/s/${id}`;
}

// Dashboard editor URL for a snap.
export function snapEditUrlFor(id: string): string {
  return `${APP_WEB_SITE_URL}/snaps/${id}/edit`;
}

// Snap counterpart of viewUrlForRequest: build the URL from the request
// origin so a local dev instance returns links to itself, not prod.
export function snapViewUrlForRequest(req: Request, id: string): string {
  try {
    const origin = new URL(req.url).origin;
    return `${origin}/s/${id}`;
  } catch {
    return snapViewUrlFor(id);
  }
}
