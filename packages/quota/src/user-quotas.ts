/// <reference types="@cloudflare/workers-types" />

import { ACCOUNT_LIMITS, PRO_SUBSCRIPTION_LIMITS } from "./limits";
import { getActiveProSubscription } from "./pro-subscription";

/*
 * Per-user effective caps, resolved in priority order: admin override row,
 * then active Pro subscription, then ACCOUNT_LIMITS defaults. Lifetime
 * licences are NOT consulted here — they unlock Studio export locally but
 * don't raise the cloud cap; only an active subscription does.
 */

export type EffectiveLimits = {
  storageBytes: number;
  activeArtifacts: number;
  perShareDurationMs: number;
  proSubscriptionActive: boolean;
};

type QuotaRow = {
  storage_bytes_override: number | null;
  // Named for the original share-only schema; now covers shares + snaps.
  active_shares_override: number | null;
};

export async function getEffectiveLimitsForUser(
  db: D1Database,
  userId: string,
): Promise<EffectiveLimits> {
  const [override, subscription] = await Promise.all([
    db
      .prepare(
        `SELECT storage_bytes_override, active_shares_override
           FROM user_quotas
           WHERE user_id = ?1
           LIMIT 1`,
      )
      .bind(userId)
      .first<QuotaRow>(),
    getActiveProSubscription(db, userId),
  ]);

  const baseStorage = subscription
    ? PRO_SUBSCRIPTION_LIMITS.totalStorageBytes
    : ACCOUNT_LIMITS.totalStorageBytes;
  const baseArtifacts = subscription
    ? PRO_SUBSCRIPTION_LIMITS.activeArtifactsPerAccount
    : ACCOUNT_LIMITS.activeArtifactsPerAccount;
  const baseShareDurationMs = subscription
    ? PRO_SUBSCRIPTION_LIMITS.perShareDurationMs
    : ACCOUNT_LIMITS.perShareDurationMs;

  return {
    storageBytes: override?.storage_bytes_override ?? baseStorage,
    activeArtifacts: override?.active_shares_override ?? baseArtifacts,
    perShareDurationMs: baseShareDurationMs,
    proSubscriptionActive: subscription !== null,
  };
}
