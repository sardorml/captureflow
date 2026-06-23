/// <reference types="@cloudflare/workers-types" />

import { ACCOUNT_LIMITS, getEffectiveLimitsForUser } from '@captureflow/quota';
import { getAppWebEnv } from './cf-env';

export async function getEffectiveStorageLimit(
  userId: string
): Promise<number> {
  const env = await getAppWebEnv();
  if (!env?.DB) return ACCOUNT_LIMITS.totalStorageBytes;
  const limits = await getEffectiveLimitsForUser(env.DB, userId);
  return limits.storageBytes;
}
