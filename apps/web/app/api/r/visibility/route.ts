import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getShare, updateShare } from '@/lib/share/db';
import { isValidSlug } from '@/lib/share/slug';
import { verifySessionOrNull } from '@/lib/share/verify-session';
import { optionsResponse, withCors } from '@/lib/share/cors';
import type { ShareApiError, ShareVisibility } from '@/lib/share/types';

const DEVICE_HEADER = 'x-captureflow-device';
const ALLOWED: ReadonlySet<ShareVisibility> = new Set([
  'public',
  'workspace',
  'private',
]);

export function OPTIONS() {
  return optionsResponse();
}

// POST /api/visibility?slug=...
// Body: { value: 'public' | 'workspace' | 'private' }
//
// Flips the share row's visibility. Two auth paths are accepted:
//   1. Desktop client: x-captureflow-device header matching the row's
//      deviceId (legacy, keeps older builds working).
//   2. Browser viewer: better-auth session cookie that resolves to
//      the share owner. The share viewer's Share modal uses this so
//      the owner can flip visibility without bouncing to the
//      dashboard.

export async function POST(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!isValidSlug(slug)) {
    return jsonError('Invalid slug', 400, 'invalid_slug');
  }

  let body: { value?: unknown };
  try {
    body = (await req.json()) as { value?: unknown };
  } catch {
    return jsonError('Invalid JSON', 400, 'invalid_json');
  }
  const value = body.value;
  if (typeof value !== 'string' || !ALLOWED.has(value as ShareVisibility)) {
    return jsonError('Invalid visibility', 400, 'invalid_visibility');
  }

  const row = await getShare(slug);
  if (!row) return jsonError('Share not found', 404, 'not_found');

  const deviceId = req.headers.get(DEVICE_HEADER);
  let authorized = false;
  if (deviceId) {
    authorized = row.deviceId === deviceId;
  } else {
    const cookieHeader = (await headers()).get('cookie');
    const session = await verifySessionOrNull(cookieHeader);
    authorized = !!session && session.userId === row.userId;
  }
  if (!authorized) return jsonError('Forbidden', 403, 'forbidden');

  await updateShare(slug, { visibility: value as ShareVisibility });
  return withCors(NextResponse.json({ visibility: value }));
}

function jsonError(error: string, status: number, code?: string) {
  const body: ShareApiError = code ? { error, code } : { error };
  return withCors(NextResponse.json(body, { status }));
}
