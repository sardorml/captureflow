/// <reference types="@cloudflare/workers-types" />

import { NextRequest, NextResponse } from 'next/server';
import { listWorkspacesForUser } from '@captureflow/quota';
import { getAppWebEnv } from '@/lib/cf-env';
import { resolveDeviceToken } from '@/lib/device-tokens';

const DEVICE_HEADER = 'x-captureflow-device';

function extractBearerToken(req: NextRequest): string | null {
  const h = req.headers.get('authorization') ?? '';
  const m = /^bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1].trim() : null;
}

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers':
    'Content-Type, Authorization, x-captureflow-device',
  'access-control-max-age': '86400',
  vary: 'Origin',
} as const;

function withCors(res: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.headers.set(k, v);
  return res;
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export type WorkspacesResponseItem = {
  id: string;
  name: string;
  kind: 'personal' | 'team';
  role: 'owner' | 'member';
};

export type WorkspacesResponse = {
  workspaces: WorkspacesResponseItem[];
};

function jsonError(error: string, status: number, code?: string) {
  const body = code ? { error, code } : { error };
  return withCors(NextResponse.json(body, { status }));
}

export async function GET(req: NextRequest) {
  const deviceId = req.headers.get(DEVICE_HEADER);
  if (!deviceId || deviceId.length < 8 || deviceId.length > 64) {
    return jsonError('Missing or invalid device header', 400, 'invalid_device');
  }
  const bearer = extractBearerToken(req);
  if (!bearer) {
    return jsonError('Sign in to list workspaces', 401, 'missing_token');
  }

  const env = await getAppWebEnv();
  if (!env?.DB) return jsonError('db unavailable', 500);

  const resolved = await resolveDeviceToken(bearer);
  if (!resolved) {
    return jsonError('Sign-in expired or revoked', 401, 'invalid_token');
  }

  const memberships = await listWorkspacesForUser(env.DB, resolved.userId);
  const body: WorkspacesResponse = {
    workspaces: memberships.map((m) => ({
      id: m.workspace_id,
      name: m.workspace_name,
      kind: m.workspace_kind === 'team' ? 'team' : 'personal',
      role: m.role === 'owner' ? 'owner' : 'member',
    })),
  };
  return withCors(NextResponse.json(body));
}
