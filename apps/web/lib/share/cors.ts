import { NextResponse } from 'next/server';

// Permissive CORS for the public share API. Endpoints are authenticated by
// the x-captureflow-device header, not by origin, so allowing any caller is
// fine. This unblocks browser-origin export flows from the desktop app,
// Electron renderer calls with webSecurity enabled, and third-party
// integrations using their own device id.
//
// Use `corsHeaders()` to spread headers onto a NextResponse, or
// `optionsResponse()` as the route's `OPTIONS` handler.

const ALLOW_ORIGIN = '*';
const ALLOW_METHODS = 'GET, HEAD, POST, DELETE, OPTIONS';
const ALLOW_HEADERS = 'Content-Type, x-captureflow-device';
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
