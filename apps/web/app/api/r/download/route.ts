import { NextRequest, NextResponse } from 'next/server';
import { getShare } from '@/lib/share/db';
import { isValidSlug } from '@/lib/share/slug';
import { getCloudflareEnv } from '@/lib/share/cf-env';
import type { ShareApiError } from '@/lib/share/types';

// `<a download>` is silently ignored on cross-origin links unless the origin
// sends `Content-Disposition: attachment`; proxying keeps the link same-origin.
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
  const headers = new Headers();
  headers.set('content-type', 'video/mp4');
  headers.set(
    'content-disposition',
    `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
      filename
    )}`
  );
  if (typeof obj.size === 'number') {
    headers.set('content-length', String(obj.size));
  }
  // Gated on visibility: a cached copy must not survive a public->private flip.
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
