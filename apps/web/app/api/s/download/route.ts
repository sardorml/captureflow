import { NextRequest, NextResponse } from 'next/server';
import { getSnap } from '@/lib/snap/db';
import { getSnapBody } from '@/lib/snap/r2';
import { isValidSnapId } from '@/lib/snap/id';
import type { SnapApiError } from '@/lib/snap/types';

// Same-origin proxy that streams the snap PNG with `Content-Disposition:
// attachment` to force a real download. The HTML `download` attribute is
// ignored on cross-origin links unless the origin sends the attachment
// header itself, and the CDN (cdn.captureflow.xyz) is cross-origin to the
// snap page (snap.captureflow.xyz). Proxying keeps the link same-origin.

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!isValidSnapId(id)) {
    return notFoundJson('Invalid id', 'invalid_id');
  }

  const row = await getSnap(id);
  if (!row || row.state !== 'ready') {
    return notFoundJson('Snap not found', 'not_found');
  }

  const obj = await getSnapBody(id);
  if (!obj) {
    return notFoundJson('Object missing', 'object_missing');
  }

  const filename = `captureflow-${id}.png`;
  const headers = new Headers();
  headers.set('content-type', 'image/png');
  headers.set(
    'content-disposition',
    `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
      filename
    )}`
  );
  if (typeof obj.size === 'number') {
    headers.set('content-length', String(obj.size));
  }
  headers.set('cache-control', 'no-store');

  return new Response(obj.body, { status: 200, headers });
}

function notFoundJson(error: string, code: string): NextResponse {
  const body: SnapApiError = { error, code };
  return NextResponse.json(body, { status: 404 });
}
