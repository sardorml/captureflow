import { NextRequest, NextResponse } from 'next/server';
import { getShare } from '@/lib/share/db';
import { isValidSlug } from '@/lib/share/slug';
import { getCloudflareEnv } from '@/lib/share/cf-env';
import type { ShareApiError } from '@/lib/share/types';

// Same-origin proxy that streams the R2 video with
// `Content-Disposition: attachment` so the browser triggers a real
// download. The CDN host (cdn.captureflow.xyz) is cross-origin to the
// share page (share.captureflow.xyz), and `<a download>` is silently
// ignored on cross-origin links unless the origin itself sends
// `Content-Disposition: attachment`. Proxying keeps the link
// same-origin so `download` works across browsers.
//
// Private shares are blocked here too: the public link surface must
// not leak bytes of a share the owner has hidden.

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
  // Plain `filename=` suffices for these base62-ish slugs; the
  // RFC 5987 `filename*` form is included so non-ASCII names would
  // still round-trip safely.
  const headers = new Headers();
  headers.set('content-type', 'video/mp4');
  headers.set(
    'content-disposition',
    `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
      filename
    )}`
  );
  // Echo size when known so the download tray shows the right total.
  if (typeof obj.size === 'number') {
    headers.set('content-length', String(obj.size));
  }
  // Keep off the edge cache: this response is gated on the share's
  // visibility, so a cached "attachment" copy must not survive a
  // public->private flip.
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
