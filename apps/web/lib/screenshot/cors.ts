import { NextResponse } from "next/server";
import type { ScreenshotApiError } from "./types";

// Allow-any-origin is safe: endpoints authenticate via x-captureflow-device + bearer, not origin.
const ALLOW_ORIGIN = "*";
const ALLOW_METHODS = "GET, HEAD, POST, PUT, DELETE, OPTIONS";
// Must include the custom upload headers so a browser-origin preflight doesn't strip them.
const ALLOW_HEADERS =
  "Content-Type, Authorization, x-captureflow-device, x-captureflow-workspace, x-captureflow-screenshot-width, x-captureflow-screenshot-height, x-captureflow-screenshot-title";
const MAX_AGE = "86400";

export function corsHeaders(): Record<string, string> {
  return {
    "access-control-allow-origin": ALLOW_ORIGIN,
    "access-control-allow-methods": ALLOW_METHODS,
    "access-control-allow-headers": ALLOW_HEADERS,
    "access-control-max-age": MAX_AGE,
    vary: "Origin",
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

export function jsonError(
  error: string,
  status: number,
  code?: string,
): NextResponse {
  const body: ScreenshotApiError = code ? { error, code } : { error };
  return withCors(NextResponse.json(body, { status }));
}
