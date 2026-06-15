import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { deleteShare, getShare } from '@/lib/share/db';
import { isValidSlug } from '@/lib/share/slug';
import { abortMultipartUpload, deleteObject } from '@/lib/share/r2';
import { verifySessionOrNull } from '@/lib/share/verify-session';
import { optionsResponse, withCors } from '@/lib/share/cors';
import type { ShareApiError } from '@/lib/share/types';

const DEVICE_HEADER = 'x-captureflow-device';

export function OPTIONS() {
  return optionsResponse();
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  // `id` is the share's public slug — the share-lib calls below take a
  // slug, so we pass `id` straight through.
  const { id } = await ctx.params;
  if (!isValidSlug(id)) {
    return jsonError('Invalid slug', 400, 'invalid_slug');
  }

  const row = await getShare(id);
  if (!row) return withCors(NextResponse.json({ ok: true }));

  // Auth: accept either the desktop's device header (legacy) OR a
  // browser session cookie that resolves to the share owner. The
  // viewer-page UI uses the session path; the desktop app and older
  // dashboards stay on the header path.
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

  if (row.uploadId) {
    await abortMultipartUpload(row.storageKey, row.uploadId);
  }
  // Webcam companion: abort its multipart if in-flight, drop its R2
  // object if uploaded. Non-fatal — a missing object on R2 is the
  // success state for us anyway. webcamState='none' means the
  // recording had no camera, so there's nothing to clean.
  if (row.webcamUploadId && row.webcamStorageKey) {
    try {
      await abortMultipartUpload(row.webcamStorageKey, row.webcamUploadId);
    } catch (err) {
      console.warn(`[delete] webcam abort failed for ${id}:`, err);
    }
  }
  await deleteObject(row.storageKey);
  if (row.posterKey) await deleteObject(row.posterKey);
  if (row.webcamStorageKey) {
    try {
      await deleteObject(row.webcamStorageKey);
    } catch (err) {
      console.warn(`[delete] webcam r2 delete failed for ${id}:`, err);
    }
  }
  await deleteShare(id);

  return withCors(NextResponse.json({ ok: true }));
}

function jsonError(error: string, status: number, code?: string) {
  const body: ShareApiError = code ? { error, code } : { error };
  return withCors(NextResponse.json(body, { status }));
}
