import { NextRequest, NextResponse } from 'next/server';
import { resolveDeviceTokenToUser } from '@/lib/share/device-tokens';
import { optionsResponse, withCors } from '@/lib/share/cors';
import type { ShareApiError } from '@/lib/share/types';

// Lightweight bearer probe so the desktop can detect a remotely-revoked
// token at startup/focus instead of waiting for the next /api/init to fail.
// 200 → token live; 401 → caller should clearShareAuth(); 400 → not a
// bearer header (treat as anonymous). Response stays minimal ({ ok, userId })
// since the desktop already has label/email from setShareAuth.

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
