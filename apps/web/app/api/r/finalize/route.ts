import { NextRequest, NextResponse } from 'next/server';
import { ACCOUNT_LIMITS } from '@captureflow/quota';
import { getShare, updateShare } from '@/lib/share/db';
import { isValidSlug } from '@/lib/share/slug';
import { completeMultipartUpload, headObject } from '@/lib/share/r2';
import { optionsResponse, withCors } from '@/lib/share/cors';
import { viewUrlForRequest } from '@/lib/site';
import type {
  FinalizeRequest,
  FinalizeResponse,
  ShareApiError,
} from '@/lib/share/types';

const DEVICE_HEADER = 'x-captureflow-device';

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: NextRequest) {
  const deviceId = req.headers.get(DEVICE_HEADER);
  if (!deviceId)
    return jsonError('Missing device header', 400, 'invalid_device');

  let body: Partial<FinalizeRequest>;
  try {
    body = (await req.json()) as Partial<FinalizeRequest>;
  } catch {
    return jsonError('Invalid JSON', 400, 'invalid_json');
  }

  if (!isValidSlug(body.slug)) {
    return jsonError('Invalid slug', 400, 'invalid_slug');
  }
  if (!Array.isArray(body.parts) || body.parts.length === 0) {
    return jsonError('Missing parts', 400, 'invalid_parts');
  }
  for (const p of body.parts) {
    if (
      !p ||
      typeof p.partNumber !== 'number' ||
      typeof p.etag !== 'string' ||
      p.etag.length === 0
    ) {
      return jsonError('Malformed part entry', 400, 'invalid_parts');
    }
  }
  const sizeBytes = body.sizeBytes;
  if (
    typeof sizeBytes !== 'number' ||
    sizeBytes <= 0 ||
    sizeBytes > ACCOUNT_LIMITS.perShareSizeBytes
  ) {
    return jsonError('Invalid size', 400, 'invalid_size');
  }

  const row = await getShare(body.slug);
  if (!row) return jsonError('Share not found', 404, 'not_found');
  if (row.deviceId !== deviceId)
    return jsonError('Forbidden', 403, 'forbidden');
  if (row.state === 'ready') {
    return withCors(
      NextResponse.json<FinalizeResponse>({
        url: viewUrlForRequest(req, row.slug),
      })
    );
  }
  if (row.state !== 'pending' || !row.uploadId) {
    return jsonError('Share not finalizable', 409, 'wrong_state');
  }

  try {
    await completeMultipartUpload(row.storageKey, row.uploadId, body.parts);
  } catch (err) {
    // R2 rejects with the underlying multipart-complete reason
    // (etag mismatch, part size, etc). Surface it so the desktop's
    // failure modal carries something actionable instead of a flat
    // "HTTP 500 unknown".
    const reason = err instanceof Error ? err.message : String(err);
    console.error('[finalize] r2 complete failed', {
      slug: row.slug,
      uploadId: row.uploadId,
      partCount: body.parts.length,
      reason,
    });
    await updateShare(row.slug, { state: 'failed', uploadId: null });
    return jsonError(`R2 complete: ${reason}`, 502, 'r2_complete_failed');
  }

  const exists = await headObject(row.storageKey);
  if (!exists) {
    await updateShare(row.slug, { state: 'failed', uploadId: null });
    return jsonError('Object missing after complete', 502, 'object_missing');
  }

  try {
    await updateShare(row.slug, {
      state: 'ready',
      uploadId: null,
      sizeBytes,
      lastViewedAt: Date.now(),
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error('[finalize] d1 update failed', {
      slug: row.slug,
      reason,
    });
    return jsonError(`DB update: ${reason}`, 500, 'db_update_failed');
  }

  const res: FinalizeResponse = { url: viewUrlForRequest(req, row.slug) };
  return withCors(NextResponse.json(res));
}

function jsonError(error: string, status: number, code?: string) {
  const body: ShareApiError = code ? { error, code } : { error };
  return withCors(NextResponse.json(body, { status }));
}
