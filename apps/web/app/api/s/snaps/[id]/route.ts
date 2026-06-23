import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { ACCOUNT_LIMITS } from '@captureflow/quota';
import { isValidSnapId } from '@/lib/snap/id';
import { getSnap, softDeleteSnap, updateSnapAfterEdit } from '@/lib/snap/db';
import { deleteSnap as deleteSnapBytes, putSnap } from '@/lib/snap/r2';
import { resolveDeviceTokenToUser } from '@/lib/snap/device-tokens';
import { verifySessionOrNull } from '@/lib/snap/verify-session';
import { optionsResponse, withCors } from '@/lib/snap/cors';
import type { SnapApiError } from '@/lib/snap/types';
import { snapViewUrlForRequest } from '@/lib/site';

// /api/s/snaps/[id] — owner-only snap management.
//
// GET    snap metadata
// PUT    replace PNG bytes (editor save)
// DELETE soft-delete (R2 bytes dropped inline)
//
// All require a bearer token + ownership of the snap row. Public PNG
// reads go through the SSR view page, which needs no auth.

function extractBearerToken(req: NextRequest): string | null {
  const h = req.headers.get('authorization') ?? '';
  const m = /^bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1].trim() : null;
}

export function OPTIONS() {
  return optionsResponse();
}

async function authorise(
  req: NextRequest,
  id: string | undefined,
  { allowSession = false }: { allowSession?: boolean } = {}
): Promise<
  | {
      kind: 'ok';
      userId: string;
      snap: NonNullable<Awaited<ReturnType<typeof getSnap>>>;
    }
  | { kind: 'error'; res: NextResponse }
> {
  if (!isValidSnapId(id)) {
    return {
      kind: 'error',
      res: jsonError('Invalid snap id', 400, 'invalid_id'),
    };
  }
  let userId: string | null = null;
  const bearer = extractBearerToken(req);
  if (bearer) {
    userId = await resolveDeviceTokenToUser(bearer);
    if (!userId) {
      return {
        kind: 'error',
        res: jsonError('Sign-in expired or revoked', 401, 'invalid_token'),
      };
    }
  } else if (allowSession) {
    // Fall back to the session cookie so the snap viewer's overflow
    // menu can call DELETE without holding a device token.
    const cookieHeader = (await headers()).get('cookie');
    const visitor = await verifySessionOrNull(cookieHeader);
    if (!visitor) {
      return {
        kind: 'error',
        res: jsonError('Sign in to manage this snap', 401, 'missing_token'),
      };
    }
    userId = visitor.userId;
  } else {
    return {
      kind: 'error',
      res: jsonError('Sign in to access this snap', 401, 'missing_token'),
    };
  }
  const snap = await getSnap(id);
  if (!snap || snap.state !== 'ready') {
    return {
      kind: 'error',
      res: jsonError('Snap not found', 404, 'not_found'),
    };
  }
  if (snap.userId !== userId) {
    return { kind: 'error', res: jsonError('Forbidden', 403, 'forbidden') };
  }
  return { kind: 'ok', userId, snap };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const a = await authorise(req, id);
  if (a.kind === 'error') return a.res;
  return withCors(NextResponse.json({ snap: a.snap }));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const a = await authorise(req, id);
  if (a.kind === 'error') return a.res;

  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('image/png')) {
    return jsonError('Unsupported content type', 400, 'invalid_content_type');
  }

  const body = await req.arrayBuffer();
  if (body.byteLength === 0) {
    return jsonError('Missing body', 400, 'no_body');
  }
  if (body.byteLength > ACCOUNT_LIMITS.perSnapSizeBytes) {
    return jsonError('Snap exceeds per-snap size cap', 413, 'size_exceeded');
  }

  await putSnap(a.snap.id, body);
  const updated = await updateSnapAfterEdit(a.snap.id, {
    sizeBytes: body.byteLength,
  });

  return withCors(
    NextResponse.json({
      snap: updated,
      viewUrl: snapViewUrlForRequest(req, a.snap.id),
    })
  );
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // DELETE accepts either a device bearer (desktop CLI) or the viewer
  // session cookie (overflow menu on snap.captureflow.xyz).
  const a = await authorise(req, id, { allowSession: true });
  if (a.kind === 'error') return a.res;

  await softDeleteSnap(a.snap.id);
  // Drop the R2 object inline: there's no cron sweep for snaps yet, so
  // otherwise the bytes would linger indefinitely. The soft-delete above
  // still handles row-level race safety.
  try {
    await deleteSnapBytes(a.snap.id);
  } catch (err) {
    console.warn('[snap] r2 delete failed:', err);
  }

  return withCors(NextResponse.json({ ok: true }));
}

function jsonError(error: string, status: number, code?: string) {
  const body: SnapApiError = code ? { error, code } : { error };
  return withCors(NextResponse.json(body, { status }));
}
