/**
 * Single source of truth for the edit URL the desktop opens at stop.
 * Mirrors the snaps pattern at `/snaps/[id]/edit`. Override via the
 * CAPTUREFLOW_APP_WEB_BASE env var for staging.
 */
const APP_WEB_BASE = process.env.CAPTUREFLOW_APP_WEB_BASE ?? 'https://captureflow.xyz'

export function buildShareEditUrl(slug: string): string {
  return `${APP_WEB_BASE}/shares/${encodeURIComponent(slug)}/edit`
}
