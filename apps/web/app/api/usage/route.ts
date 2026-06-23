/// <reference types="@cloudflare/workers-types" />

import { NextRequest, NextResponse } from 'next/server';
import {
  activeArtifactCountForUser,
  getEffectiveLimitsForUser,
  getWorkspaceById,
  isWorkspaceMember,
  totalStorageForUser,
} from '@captureflow/quota';
import { getAppWebEnv } from '@/lib/cf-env';
import { resolveDeviceToken } from '@/lib/device-tokens';

// GET /api/usage — account-scoped usage + entitlement.
//
// Lives on app-web because account state (auth, subscription, quota
// overrides) is owned by this service, giving one source of truth across
// the share + snap workers.
//
// Auth: bearer device token from desktop sign-in, resolved via the
// device-tokens table (one D1 query, no session cookie).

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

export type UsageResponse = {
  usedBytes: number;
  limitBytes: number;
  activeCount: number;
  activeLimit: number;
  capReached: boolean;
  isDev: boolean;
  proSubscriptionActive: boolean;
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
    return jsonError('Sign in to read usage', 401, 'missing_token');
  }

  const env = await getAppWebEnv();
  if (!env?.DB) return jsonError('db unavailable', 500);

  const resolved = await resolveDeviceToken(bearer);
  if (!resolved) {
    return jsonError('Sign-in expired or revoked', 401, 'invalid_token');
  }
  const bearerUserId = resolved.userId;

  // Optional workspace scope. Pro is per-user, so quota belongs to the
  // workspace OWNER: a free teammate recording into a Pro owner's
  // workspace should see the owner's limit, not their own. Verify
  // membership first — non-members fall back to their own usage view.
  const requestedWorkspace = new URL(req.url).searchParams.get('workspace_id');
  let quotaUserId = bearerUserId;
  if (requestedWorkspace) {
    const isMember = await isWorkspaceMember(
      env.DB,
      requestedWorkspace,
      bearerUserId
    );
    if (isMember) {
      const ws = await getWorkspaceById(env.DB, requestedWorkspace);
      if (ws) quotaUserId = ws.owner_user_id;
    }
  }

  const [usedBytes, activeCount, limits] = await Promise.all([
    totalStorageForUser(env.DB, quotaUserId),
    activeArtifactCountForUser(env.DB, quotaUserId),
    getEffectiveLimitsForUser(env.DB, quotaUserId),
  ]);

  // capReached is purely numeric here (no dev-allowlist on app-web yet).
  // The share/snap upload paths enforce caps via their own allowlist, so
  // a dev device may keep uploading even when this reports capReached.
  const capReached =
    usedBytes >= limits.storageBytes || activeCount >= limits.activeArtifacts;

  const body: UsageResponse = {
    usedBytes,
    limitBytes: limits.storageBytes,
    activeCount,
    activeLimit: limits.activeArtifacts,
    capReached,
    isDev: false,
    proSubscriptionActive: limits.proSubscriptionActive,
  };
  return withCors(NextResponse.json(body));
}
