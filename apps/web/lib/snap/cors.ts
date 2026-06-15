import { NextResponse } from 'next/server';

// Permissive CORS for the snap API. Mirrors the share CORS posture —
// endpoints authenticate via x-captureflow-device + bearer, not
// origin, so allow-any-origin is fine.

const ALLOW_ORIGIN = '*';
const ALLOW_METHODS = 'GET, HEAD, POST, PUT, DELETE, OPTIONS';
// Includes the custom upload headers the /api/s/upload route reads, so a
// browser-origin preflight doesn't strip them (the desktop uploads from
// the Electron main process via Node fetch, which has no preflight).
const ALLOW_HEADERS =
  'Content-Type, Authorization, x-captureflow-device, x-captureflow-workspace, x-captureflow-snap-width, x-captureflow-snap-height, x-captureflow-snap-title';
const MAX_AGE = '86400';

export function corsHeaders(): Record<string, string> {
  return {
    'access-control-allow-origin': ALLOW_ORIGIN,
    'access-control-allow-methods': ALLOW_METHODS,
    'access-control-allow-headers': ALLOW_HEADERS,
    'access-control-max-age': MAX_AGE,
    vary: 'Origin',
  };
}

export function withCors(res: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(corsHeaders())) {
    res.headers.set(k, v);
  }
  return res;
}

export function optionsResponse(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}
