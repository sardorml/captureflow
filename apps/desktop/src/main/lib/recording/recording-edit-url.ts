const APP_WEB_BASE =
  process.env.CAPTUREFLOW_APP_WEB_BASE ?? "https://captureflow.xyz";

export function buildRecordingEditUrl(slug: string): string {
  return `${APP_WEB_BASE}/recordings/${encodeURIComponent(slug)}/edit`;
}
