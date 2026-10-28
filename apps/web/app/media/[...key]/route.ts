/// <reference types="@cloudflare/workers-types" />

import { NextRequest, NextResponse } from "next/server";
import { getInjectedEnv } from "@captureflow/selfhost/env-slot";
import { parseByteRange, resolveByteRange } from "@/lib/byte-range";
import { etagFromIfNoneMatch } from "@/lib/etag-match";

/*
 * The Docker image's stand-in for the R2 custom domain (R2_PUBLIC_BASE_URL
 * points here): it serves bucket objects by key exactly as the CDN does,
 * no more. Private media still goes through /api/r/m/[token]. On Cloudflare
 * nothing is injected, so this is a 404 and the CDN stays the only origin.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const bucket = getInjectedEnv<{ BUCKET?: R2Bucket }>()?.BUCKET;
  if (!bucket) return new NextResponse("Not found", { status: 404 });

  const { key: segments } = await params;
  const key = (segments ?? []).map((s) => decodeURIComponent(s)).join("/");

  const range = parseByteRange(req.headers.get("range"));
  if (range === null) return unsatisfiable(bucket, key);
  const etagDoesNotMatch = etagFromIfNoneMatch(
    req.headers.get("if-none-match"),
  );

  let obj: R2Object | R2ObjectBody | null;
  try {
    obj = range
      ? await bucket.get(key, { range })
      : await bucket.get(
          key,
          etagDoesNotMatch ? { onlyIf: { etagDoesNotMatch } } : undefined,
        );
  } catch {
    return range
      ? unsatisfiable(bucket, key)
      : new NextResponse("Not found", { status: 404 });
  }
  if (!obj) return new NextResponse("Not found", { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  if (!headers.has("content-type"))
    headers.set("content-type", "application/octet-stream");
  headers.set("accept-ranges", "bytes");
  headers.set("etag", obj.httpEtag);

  if (!("body" in obj)) return new NextResponse(null, { status: 304, headers });
  if (!range) {
    headers.set("content-length", String(obj.size));
    return new Response(obj.body, { status: 200, headers });
  }
  const span = resolveByteRange(range, obj.size);
  if (!span) return unsatisfiable(bucket, key);
  headers.set("content-range", `bytes ${span.start}-${span.end}/${obj.size}`);
  headers.set("content-length", String(span.end - span.start + 1));
  return new Response(obj.body, { status: 206, headers });
}

async function unsatisfiable(bucket: R2Bucket, key: string) {
  const head = await bucket.head(key).catch(() => null);
  if (!head) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(null, {
    status: 416,
    headers: { "content-range": `bytes */${head.size}` },
  });
}
