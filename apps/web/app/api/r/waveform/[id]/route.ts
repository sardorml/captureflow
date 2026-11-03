import { NextResponse } from "next/server";
import { headers as requestHeaders } from "next/headers";
import { getCloudflareEnv } from "@/lib/recording/cf-env";
import { getRecording } from "@/lib/recording/db";
import { isValidSlug } from "@/lib/recording/slug";
import { verifySessionOrNull } from "@/lib/recording/verify-session";
import { canViewResource } from "@/lib/visibility";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// The editor reads the audio here rather than from the CDN: script can only read
// a cross-origin file carrying CORS headers, and the copy the player leaves in
// the CDN's and the browser's caches is not guaranteed to have them.
export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  if (!isValidSlug(id)) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }
  const track = new URL(req.url).searchParams.get("track");
  if (track !== null && track !== "webcam") {
    return NextResponse.json({ error: "invalid_track" }, { status: 400 });
  }

  const row = await getRecording(id);
  const visitor = await verifySessionOrNull(
    (await requestHeaders()).get("cookie"),
  );
  if (!row || row.state !== "ready" || !canViewResource(visitor, row)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const key = track === "webcam" ? row.webcamStorageKey : row.storageKey;
  if (!key) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const env = await getCloudflareEnv();
  if (!env?.BUCKET) {
    return NextResponse.json({ error: "r2_unavailable" }, { status: 500 });
  }
  const obj = await env.BUCKET.get(key);
  if (!obj) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return new Response(obj.body, {
    headers: {
      "content-type": obj.httpMetadata?.contentType ?? "video/mp4",
      "content-length": String(obj.size),
      // Gated on visibility: a cached copy must not survive a public->private flip.
      "cache-control": "no-store",
    },
  });
}
