/// <reference types="@cloudflare/workers-types" />

import { ACCOUNT_LIMITS, PRO_SUBSCRIPTION_LIMITS } from './limits';
import { getActiveProSubscription } from './pro-subscription';

// Per-user effective caps. Reads three sources in priority order:
//   1. explicit admin override row in `user_quotas` (per-column),
//   2. active Pro subscription in `pro_subscription` (bumps both caps),
//   3. ACCOUNT_LIMITS defaults.
// Lifetime licences are NOT consulted here: they unlock Studio export
// locally in the desktop app but do not raise the cloud cap. Only an
// active monthly/annual subscription does.

export type EffectiveLimits = {
  storageBytes: number;
  activeArtifacts: number;
  // Per-share duration cap (ms); the share-init route rejects uploads
  // that exceed the caller's tier.
  perShareDurationMs: number;
  // Surfaced so callers (api/me, the desktop's storage modal) can show
  // the tier without re-querying the subscription table.
  proSubscriptionActive: boolean;
};

type QuotaRow = {
  storage_bytes_override: number | null;
  // Column kept verbatim from the original share-only schema; the
  // semantic now covers both shares and snaps (account-wide
  // artifact count).
  active_shares_override: number | null;
};

export async function getEffectiveLimitsForUser(
  db: D1Database,
  userId: string
): Promise<EffectiveLimits> {
  const [override, subscription] = await Promise.all([
    db
      .prepare(
        `SELECT storage_bytes_override, active_shares_override
           FROM user_quotas
           WHERE user_id = ?1
           LIMIT 1`
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
