import { NextRequest, NextResponse } from 'next/server';
import { getShare, updateShare } from '@/lib/share/db';
import { isValidSlug } from '@/lib/share/slug';
import { abortMultipartUpload } from '@/lib/share/r2';
import { optionsResponse, withCors, jsonError } from '@/lib/share/cors';
import type { AbortRequest } from '@/lib/share/types';

const DEVICE_HEADER = 'x-captureflow-device';

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: NextRequest) {
  const deviceId = req.headers.get(DEVICE_HEADER);
  if (!deviceId)
    return jsonError('Missing device header', 400, 'invalid_device');

  let body: Partial<AbortRequest>;
  try {
    body = (await req.json()) as Partial<AbortRequest>;
  } catch {
    return jsonError('Invalid JSON', 400, 'invalid_json');
  }

  if (!isValidSlug(body.slug)) {
    return jsonError('Invalid slug', 400, 'invalid_slug');
  }

  const row = await getShare(body.slug);
  if (!row) return withCors(NextResponse.json({ ok: true }));
  if (row.deviceId !== deviceId)
    return jsonError('Forbidden', 403, 'forbidden');

  if (row.uploadId) {
    await abortMultipartUpload(row.storageKey, row.uploadId);
  }
  await updateShare(row.slug, { state: 'failed', uploadId: null });

  return withCors(NextResponse.json({ ok: true }));
}

