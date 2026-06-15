import { NextRequest, NextResponse } from 'next/server';
import { isDevDevice } from '@/lib/share/dev-allowlist';
import { resolveDeviceTokenToUser } from '@/lib/share/device-tokens';
import { optionsResponse, withCors } from '@/lib/share/cors';
import {
  activeArtifactCountForUser,
  getEffectiveLimitsForUser,
  totalStorageForUser,
} from '@/lib/share/quota';
import type { ShareApiError } from '@/lib/share/types';

const DEVICE_HEADER = 'x-captureflow-device';

// GET /api/usage
//
// Reports current storage + active-share usage for the signed-in
// account so the desktop client can paint the cap-reached lock on
// its record button before /api/init would have rejected the next
// upload. Bearer is required — every share is account-owned, so an
// anonymous probe would have nothing meaningful to report. The
// desktop only probes once it has a bearer; signed-out clients
// already paint the auth lock instead of the quota lock.
//
// Dev-allowlisted devices always report `capReached: false` to
// match the bypass in /api/init.

function extractBearerToken(req: NextRequest): string | null {
  const h = req.headers.get('authorization') ?? '';
  const m = /^bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1].trim() : null;
}

export type UsageResponse = {
  usedBytes: number;
  limitBytes: number;
  activeCount: number;
  activeLimit: number;
  capReached: boolean;
  isDev: boolean;
};

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  const deviceId = req.headers.get(DEVICE_HEADER);
  if (!deviceId || deviceId.length < 8 || deviceId.length > 64) {
    return jsonError('Missing or invalid device header', 400, 'invalid_device');
  }

  const bearer = extractBearerToken(req);
  if (!bearer) {
    return jsonError('Sign in to read share usage', 401, 'missing_token');
  }
  const userId = await resolveDeviceTokenToUser(bearer);
  if (!userId) {
    return jsonError('Sign-in expired or revoked', 401, 'invalid_token');
  }

  const [usedBytes, activeCount, isDev, limits] = await Promise.all([
    totalStorageForUser(userId),
    activeArtifactCountForUser(userId),
    isDevDevice(deviceId),
    getEffectiveLimitsForUser(userId),
  ]);

  const limitBytes = limits.storageBytes;
  const activeLimit = limits.activeArtifacts;
  const capReached =
    !isDev && (usedBytes >= limitBytes || activeCount >= activeLimit);

  const body: UsageResponse = {
    usedBytes,
    limitBytes,
    activeCount,
    activeLimit,
    capReached,
    isDev,
  };
  return withCors(NextResponse.json(body));
}

function jsonError(error: string, status: number, code?: string) {
  const body: ShareApiError = code ? { error, code } : { error };
  return withCors(NextResponse.json(body, { status }));
}
