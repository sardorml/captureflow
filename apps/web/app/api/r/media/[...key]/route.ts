/// <reference types="@cloudflare/workers-types" />

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/share/cf-env";

/*
 * Local-dev-only inline media proxy: miniflare's local R2 (.wrangler/) has no
 * HTTP origin, so bytes recorded against `next dev` are unreachable from the
 * CDN. Streams them same-origin from the BUCKET binding instead. Wire it via:
 *   .env.local  NEXT_PUBLIC_R2_PUBLIC_BASE_URL=http://localhost:3032/api/r/media   (editor reads process.env)
 *   .dev.vars   R2_PUBLIC_BASE_URL=http://localhost:3032/api/r/media               (viewer publicUrlFor reads the binding)
 * Guarded to localhost so it can never stream bytes around the private-share
 * visibility gate that /api/r/download enforces.
 */

const CONTENT_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  m4a: "audio/mp4",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  json: "application/json",
};

function contentTypeFor(key: string, fromMeta?: string): string {
  if (fromMeta) return fromMeta;
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  return CONTENT_TYPES[ext] ?? "application/octet-stream";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  // Never serve raw bytes (which bypass visibility checks) from a real host.
  const host = req.nextUrl.hostname;
  if (host !== "localhost" && host !== "127.0.0.1") {
    return new NextResponse("Not found", { status: 404 });
  }

  const { key: segments } = await params;
  const key = (segments ?? []).map((s) => decodeURIComponent(s)).join("/");
  if (!key) return new NextResponse("Not found", { status: 404 });

  const env = await getCloudflareEnv();
  if (!env?.BUCKET) {
    return new NextResponse("R2 unavailable", { status: 500 });
  }

  // On a ranged R2 `.get`, `.size` is always the FULL object size while
  // `.body` carries just the requested slice.
  const rangeHeader = req.headers.get("range");
  let range: { offset: number; length?: number } | undefined;
  let explicitEnd: number | undefined;
  if (rangeHeader) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
    if (m) {
      const start = m[1] ? Number(m[1]) : 0;
      const end = m[2] ? Number(m[2]) : undefined;
      range = {
        offset: start,
        length: end !== undefined ? end - start + 1 : undefined,
      };
      explicitEnd = end;
    }
  }

  const obj = await env.BUCKET.get(key, range ? { range } : undefined);
  if (!obj) return new NextResponse("Object missing", { status: 404 });

  const total = obj.size;
  const headers = new Headers();
  headers.set(
    "content-type",
    contentTypeFor(key, obj.httpMetadata?.contentType),
  );
  headers.set("accept-ranges", "bytes");
  headers.set("cache-control", "no-store");

  if (range) {
    const start = range.offset;
    const end = explicitEnd !== undefined ? explicitEnd : total - 1;
    headers.set("content-range", `bytes ${start}-${end}/${total}`);
    headers.set("content-length", String(end - start + 1));
    return new Response(obj.body, { status: 206, headers });
  }

  headers.set("content-length", String(total));
  return new Response(obj.body, { status: 200, headers });
}
