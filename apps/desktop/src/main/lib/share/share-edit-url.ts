const APP_WEB_BASE = process.env.CAPTUREFLOW_APP_WEB_BASE ?? 'https://captureflow.xyz'

export function buildShareEditUrl(slug: string): string {
  return `${APP_WEB_BASE}/shares/${encodeURIComponent(slug)}/edit`
}
