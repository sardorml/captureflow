import { NextRequest, NextResponse } from 'next/server';
import { getShare } from '@/lib/share/db';
import { isValidSlug } from '@/lib/share/slug';
import { uploadPart } from '@/lib/share/r2';
import { optionsResponse, withCors } from '@/lib/share/cors';
import type { PartResponse, ShareApiError } from '@/lib/share/types';

const DEVICE_HEADER = 'x-captureflow-device';
const MAX_PART_NUMBER = 10000; // R2 multipart upper bound
const MAX_PART_BYTES = 100 * 1024 * 1024;

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: NextRequest) {
  const deviceId = req.headers.get(DEVICE_HEADER);
  if (!deviceId)
    return jsonError('Missing device header', 400, 'invalid_device');

  const slug = req.nextUrl.searchParams.get('slug');
  const partRaw = req.nextUrl.searchParams.get('part');
  if (!isValidSlug(slug)) {
    return jsonError('Invalid slug', 400, 'invalid_slug');
  }
  const partNumber = Number(partRaw);
  if (
    !Number.isInteger(partNumber) ||
    partNumber < 1 ||
    partNumber > MAX_PART_NUMBER
  ) {
    return jsonError('Invalid part number', 400, 'invalid_part');
  }

  const row = await getShare(slug);
  if (!row) return jsonError('Share not found', 404, 'not_found');
  if (row.deviceId !== deviceId)
    return jsonError('Forbidden', 403, 'forbidden');
  if (row.state !== 'pending') {
    return jsonError('Share is not pending', 409, 'wrong_state');
  }
  if (!row.uploadId) {
    return jsonError('Share has no upload in progress', 409, 'no_upload');
  }

  const contentLengthRaw = req.headers.get('content-length');
  const contentLength = contentLengthRaw ? Number(contentLengthRaw) : null;
  if (contentLength !== null && contentLength > MAX_PART_BYTES) {
    return jsonError('Chunk too large', 413, 'chunk_too_large');
  }

  // R2's uploadPart needs a known-length body; the request stream has none, so buffer the chunk.
  const buffer = await req.arrayBuffer();
  if (buffer.byteLength === 0) {
    return jsonError('Missing chunk body', 400, 'no_body');
  }

  const result = await uploadPart(
    row.storageKey,
    row.uploadId,
    partNumber,
    buffer
  );

  const res: PartResponse = {
    partNumber: result.partNumber,
    etag: result.etag,
  };
  return withCors(NextResponse.json(res));
}

function jsonError(error: string, status: number, code?: string) {
  const body: ShareApiError = code ? { error, code } : { error };
  return withCors(NextResponse.json(body, { status }));
}
