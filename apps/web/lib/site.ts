// Site-level URL helpers.
//
// Every surface lives on a single host (captureflow.xyz): the marketing
// landing, the dashboard, and the public share/snap viewers. The share
// viewer is served under `/r` (captureflow.xyz/r/<id>) and the snap
// viewer under `/s` (captureflow.xyz/s/<id>).

// Root host. The viewer, landing, and dashboard all share this origin.
// `NEXT_PUBLIC_MARKETING_SITE_URL` is set in wrangler.jsonc [vars]; the
// fallback is the production root host.
export const SITE_URL =
  process.env.NEXT_PUBLIC_MARKETING_SITE_URL ?? 'https://captureflow.xyz';

// Aliases kept for readability at call sites; all resolve to the root host.
export const SHARE_SITE_URL = SITE_URL;
export const MARKETING_SITE_URL = SITE_URL;

export const APP_WEB_SITE_URL =
  process.env.NEXT_PUBLIC_APP_WEB_SITE_URL ?? SITE_URL;

export const PRODUCT_NAME = 'CaptureFlow';

// Open-source repository (the Corresponding Source). Surfaced as the
// AGPL-3.0 §7(b) attribution link in the public viewers — downstream
// operators must preserve it.
export const SOURCE_REPO_URL = 'https://github.com/sardorml/captureflow';

// Documentation site (VitePress, apps/docs). In production it's a separate
// host; in development it points at the local docs dev server (which is pinned
// to port 3033 in apps/docs/package.json). Override either with
// NEXT_PUBLIC_DOCS_URL.
export const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL ??
  (process.env.NODE_ENV === 'production'
    ? 'https://docs.captureflow.xyz'
    : 'http://localhost:3033');

// GitHub releases — the desktop recorder ships its builds here (and
// electron-updater pulls updates from the same place).
export const RELEASES_URL = `${SOURCE_REPO_URL}/releases`;

// Direct desktop-app download. Defaults to the latest GitHub release; once a
// CDN-hosted .dmg exists, override with NEXT_PUBLIC_DOWNLOAD_URL.
export const DOWNLOAD_URL =
  process.env.NEXT_PUBLIC_DOWNLOAD_URL ?? `${SOURCE_REPO_URL}/releases/latest`;

// Public viewer URL for a share. The id is the share's public slug;
// the viewer lives at captureflow.xyz/r/<id>.
export function viewUrlFor(id: string): string {
  return `${SITE_URL}/r/${id}`;
}

// Build a viewer URL from the incoming request's origin instead of the
// hard-coded SITE_URL. Used by API routes that return the public link
// to the client — when the desktop app is hitting a local dev instance,
// we want the returned URL to point at that same instance (otherwise
// clicking "open" in the modal lands on prod, where the id doesn't
// exist).
//
// Falls back to viewUrlFor() if the request URL can't be parsed.
export function viewUrlForRequest(req: Request, id: string): string {
  try {
    const origin = new URL(req.url).origin;
    return `${origin}/r/${id}`;
  } catch {
    return viewUrlFor(id);
  }
}

// ---------------------------------------------------------------------
// Snap helpers.
//
// The snap viewer is served under `/s` on the root host, so its public
// URL is captureflow.xyz/s/<id>. The dashboard editor is the app's own
// `/snaps/<id>/edit` route on the same host.
// ---------------------------------------------------------------------

// Snap viewer host. Resolves to the single root host.
export const SNAP_SITE_URL = SITE_URL;

// Host for the editor + login (app-web). Resolves to the app-web host.
export const APP_SITE_URL = APP_WEB_SITE_URL;

// CDN origin for direct R2 reads of snap PNGs. Anchored on
// R2_PUBLIC_BASE_URL (cdn.captureflow.xyz) so every CaptureFlow surface
// points at the same domain.
export const R2_PUBLIC_BASE_URL =
  process.env.R2_PUBLIC_BASE_URL ?? 'https://cdn.captureflow.xyz';

// Public viewer URL for a snap. The viewer lives at captureflow.xyz/s/<id>.
export function snapViewUrlFor(id: string): string {
  return `${SITE_URL}/s/${id}`;
}

// Dashboard editor URL for a snap — the app's own /snaps/<id>/edit route,
// same origin as the viewer.
export function snapEditUrlFor(id: string): string {
  return `${APP_WEB_SITE_URL}/snaps/${id}/edit`;
}

// Build a snap view URL from the incoming request's origin instead of
// the hard-coded SITE_URL — so a local dev instance returns URLs that
// point at itself, not prod. Mirrors viewUrlForRequest for shares.
export function snapViewUrlForRequest(req: Request, id: string): string {
  try {
    const origin = new URL(req.url).origin;
    return `${origin}/s/${id}`;
  } catch {
    return snapViewUrlFor(id);
  }
}
