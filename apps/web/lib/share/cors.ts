import { NextResponse } from "next/server";
import type { ShareApiError } from "./types";

const ALLOW_ORIGIN = "*";
const ALLOW_METHODS = "GET, HEAD, POST, DELETE, OPTIONS";
const ALLOW_HEADERS = "Content-Type, x-captureflow-device";
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
  const body: ShareApiError = code ? { error, code } : { error };
  return withCors(NextResponse.json(body, { status }));
}
