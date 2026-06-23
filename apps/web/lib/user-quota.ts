/// <reference types="@cloudflare/workers-types" />

import { ACCOUNT_LIMITS, getEffectiveLimitsForUser } from '@captureflow/quota';
import { getAppWebEnv } from './cf-env';

// Reads the per-user storage override from `user_quotas` so the dashboard's
// storage bar reflects the same effective cap /api/init and /api/usage enforce.
//
// Falls back to ACCOUNT_LIMITS.totalStorageBytes when no row exists, the
// column is NULL, or the D1 binding is unreachable (local dev without
// OpenNext's Cloudflare runtime, tests).

export async function getEffectiveStorageLimit(
  userId: string
): Promise<number> {
  const env = await getAppWebEnv();
  if (!env?.DB) return ACCOUNT_LIMITS.totalStorageBytes;
  const limits = await getEffectiveLimitsForUser(env.DB, userId);
  return limits.storageBytes;
}
