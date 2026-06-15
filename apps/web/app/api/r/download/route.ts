import { NextRequest, NextResponse } from 'next/server';
import { getShare } from '@/lib/share/db';
import { isValidSlug } from '@/lib/share/slug';
import { getCloudflareEnv } from '@/lib/share/cf-env';
import type { ShareApiError } from '@/lib/share/types';

// Same-origin proxy that streams the R2 video back with
// `Content-Disposition: attachment` so the browser triggers a real
// download instead of an inline preview. Needed because the public
// CDN host (cdn.captureflow.xyz) is cross-origin to the share page
// (share.captureflow.xyz), and the HTML `download` attribute is
// silently ignored on cross-origin links unless the origin sends
// `Content-Disposition: attachment` itself. Routing through this
// endpoint keeps the link same-origin, so `<a download>` works
// uniformly across browsers.
//
// Private shares are blocked here for the same reason they're
// blocked on the player page — the public link surface must not
// leak bytes of a share the owner has hidden.

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!isValidSlug(slug)) {
    return notFoundJson('Invalid slug', 'invalid_slug');
  }

  const row = await getShare(slug);
  if (!row || row.state !== 'ready' || row.visibility === 'private') {
    return notFoundJson('Share not found', 'not_found');
  }

  const env = await getCloudflareEnv();
  if (!env?.BUCKET) {
    return jsonError('R2 unavailable', 500, 'r2_unavailable');
  }

  const obj = await env.BUCKET.get(row.storageKey);
  if (!obj) {
    return notFoundJson('Object missing', 'object_missing');
  }

  const filename = `captureflow-${slug}.mp4`;
  // RFC 5987 filename* lets non-ASCII names round-trip safely.
  // Plain `filename=` quoted is enough for the slug-only fallback
  // here (slugs are restricted to base62-ish chars) but include the
  // UTF-8 form for parity with how modern browsers expect.
  const headers = new Headers();
  headers.set('content-type', 'video/mp4');
  headers.set(
    'content-disposition',
    `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
      filename
    )}`
  );
  // Echo size when we have it — helps browsers show the right
  // total in the download tray.
  if (typeof obj.size === 'number') {
    headers.set('content-length', String(obj.size));
  }
  // Keep this response off the edge cache — the byte stream is the
  // same as the CDN URL, but tying download responses to the share's
  // visibility state means we don't want a stale "attachment" copy
  // surviving a public→private flip.
  headers.set('cache-control', 'no-store');

  return new Response(obj.body, { status: 200, headers });
}

function notFoundJson(error: string, code: string): NextResponse {
  const body: ShareApiError = { error, code };
  return NextResponse.json(body, { status: 404 });
}

function jsonError(error: string, status: number, code: string): NextResponse {
  const body: ShareApiError = { error, code };
  return NextResponse.json(body, { status });
}
