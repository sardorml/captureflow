import { NextRequest, NextResponse } from "next/server";
import { getRecording } from "@/lib/recording/db";
import { isValidSlug } from "@/lib/recording/slug";
import { getCloudflareEnv } from "@/lib/recording/cf-env";
import type { RecordingApiError } from "@/lib/recording/types";

// `<a download>` is silently ignored on cross-origin links unless the origin
// sends `Content-Disposition: attachment`; proxying keeps the link same-origin.
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!isValidSlug(slug)) {
    return notFoundJson("Invalid slug", "invalid_slug");
  }

  const row = await getRecording(slug);
  if (!row || row.state !== "ready" || row.visibility === "private") {
    return notFoundJson("Recording not found", "not_found");
  }

  const env = await getCloudflareEnv();
  if (!env?.BUCKET) {
    return jsonError("R2 unavailable", 500, "r2_unavailable");
  }

  const obj = await env.BUCKET.get(row.storageKey);
  if (!obj) {
    return notFoundJson("Object missing", "object_missing");
  }

  const filename = `captureflow-${slug}.mp4`;
  const headers = new Headers();
  headers.set("content-type", "video/mp4");
  headers.set(
    "content-disposition",
    `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
      filename,
    )}`,
  );
  if (typeof obj.size === "number") {
    headers.set("content-length", String(obj.size));
  }
  // Gated on visibility: a cached copy must not survive a public->private flip.
  headers.set("cache-control", "no-store");

  return new Response(obj.body, { status: 200, headers });
}

function notFoundJson(error: string, code: string): NextResponse {
  const body: RecordingApiError = { error, code };
  return NextResponse.json(body, { status: 404 });
}

function jsonError(error: string, status: number, code: string): NextResponse {
  const body: RecordingApiError = { error, code };
  return NextResponse.json(body, { status });
}
