import { NextRequest, NextResponse } from 'next/server';
import { resolveDeviceTokenToUser } from '@/lib/share/device-tokens';
import { optionsResponse, withCors } from '@/lib/share/cors';
import type { ShareApiError } from '@/lib/share/types';

// GET /api/auth/check
//
// Lightweight bearer probe. The desktop calls this at startup and on
// window focus so a remotely-revoked token can flip the lock icon back
// on without waiting until the next /api/init attempt fails. 200 → the
// token is live; 401 → caller should clearShareAuth(); 400 → header
// wasn't a bearer at all (treat as anonymous, no action needed).
//
// We intentionally keep the response minimal — { ok: true, userId } —
// rather than echoing the label/email here. The desktop already has
// those from setShareAuth at sign-in time; we only need a yes/no on
// liveness.

function extractBearer(req: NextRequest): string | null {
  const h = req.headers.get('authorization') ?? '';
  const m = /^bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1].trim() : null;
}

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  const bearer = extractBearer(req);
  if (!bearer) {
    return jsonError('Missing bearer token', 400, 'missing_token');
  }
  const userId = await resolveDeviceTokenToUser(bearer);
  if (!userId) {
    return jsonError('Sign-in expired or revoked', 401, 'invalid_token');
  }
  return withCors(NextResponse.json({ ok: true, userId }));
}

function jsonError(error: string, status: number, code?: string) {
  const body: ShareApiError = code ? { error, code } : { error };
  return withCors(NextResponse.json(body, { status }));
}
