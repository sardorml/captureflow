/// <reference types="@cloudflare/workers-types" />

import { NextRequest, NextResponse } from "next/server";
import { getAppWebEnv } from "@/lib/cf-env";
import { openMediaLink } from "@/lib/media-link";
import { parseByteRange, resolveByteRange } from "@/lib/byte-range";
import { etagFromIfNoneMatch } from "@/lib/etag-match";

// Streams private and workspace media behind an expiring link minted by the
// page that checked the viewer. Public media stays on the CDN.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const env = await getAppWebEnv();
  if (!env?.BUCKET || !env.BETTER_AUTH_SECRET) {
    return new NextResponse("Unavailable", { status: 503 });
  }
  const { token } = await params;
  const key = await openMediaLink(env.BETTER_AUTH_SECRET, token);
  if (!key) return new NextResponse("Link expired", { status: 403 });

  const range = parseByteRange(req.headers.get("range"));
  if (range === null) return unsatisfiable(env.BUCKET, key);

  /*
   * A whole-object request may be conditional: R2 compares the tags and
   * hands back the object without a body when one still matches. The
   * request's Headers can't cross the binding whole, so only the tags go.
   */
  const etagDoesNotMatch = etagFromIfNoneMatch(
    req.headers.get("if-none-match"),
  );
  let obj: R2Object | R2ObjectBody | null;
  try {
    obj = range
      ? await env.BUCKET.get(key, { range })
      : etagDoesNotMatch
        ? await env.BUCKET.get(key, { onlyIf: { etagDoesNotMatch } })
        : await env.BUCKET.get(key);
  } catch {
    return unsatisfiable(env.BUCKET, key);
  }
  if (!obj) return new NextResponse("Not found", { status: 404 });

  const headers = new Headers();
  headers.set(
    "content-type",
    obj.httpMetadata?.contentType ?? "application/octet-stream",
  );
  headers.set("accept-ranges", "bytes");
  headers.set("etag", obj.httpEtag);
  // Per-viewer link: never in a shared cache.
  headers.set("cache-control", "private, max-age=3600");

  if (!hasBody(obj)) {
    return new NextResponse(null, { status: 304, headers });
  }
  if (!range) {
    headers.set("content-length", String(obj.size));
    return new Response(obj.body, { status: 200, headers });
  }
  const span = resolveByteRange(range, obj.size);
  if (!span) return unsatisfiable(env.BUCKET, key);
  headers.set("content-range", `bytes ${span.start}-${span.end}/${obj.size}`);
  headers.set("content-length", String(span.end - span.start + 1));
  return new Response(obj.body, { status: 206, headers });
}

function hasBody(obj: R2Object | R2ObjectBody): obj is R2ObjectBody {
  return "body" in obj;
}

async function unsatisfiable(bucket: R2Bucket, key: string) {
  const head = await bucket.head(key);
  if (!head) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(null, {
    status: 416,
    headers: { "content-range": `bytes */${head.size}` },
  });
}
