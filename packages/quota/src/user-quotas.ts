/// <reference types="@cloudflare/workers-types" />

import { ACCOUNT_LIMITS, storageBytesForVariant } from "./limits";
import {
  getActiveProSubscription,
  listActiveProUserIds,
} from "./pro-subscription";

/*
 * Per-user effective caps, resolved in priority order: admin storage override,
 * then the larger of an active Pro subscription and an admin-granted plan,
 * then ACCOUNT_LIMITS defaults. Lifetime licences are NOT consulted here —
 * they unlock Studio export locally but don't raise the cloud cap.
 */

export type GrantedPlan = {
  variantId: string;
  expiresAt: number | null;
};

// `proSubscriptionActive` is the wire name the desktop app reads; a granted
// plan counts, since it buys the same tier.
export type EffectiveLimits = {
  storageBytes: number;
  proSubscriptionActive: boolean;
};

export function isGrantActive(
  grant: GrantedPlan | null,
  nowMs: number,
): grant is GrantedPlan {
  return (
    grant !== null && (grant.expiresAt === null || grant.expiresAt > nowMs)
  );
}

export function resolveEffectiveLimits(input: {
  storageBytesOverride: number | null;
  subscriptionVariantId: string | null;
  grant: GrantedPlan | null;
  nowMs: number;
}): EffectiveLimits {
  const grant = isGrantActive(input.grant, input.nowMs) ? input.grant : null;
  const planBytes = [input.subscriptionVariantId, grant?.variantId]
    .filter((v): v is string => v != null)
    .map(storageBytesForVariant);
  const baseStorage = planBytes.length
    ? Math.max(...planBytes)
    : ACCOUNT_LIMITS.totalStorageBytes;
  return {
    storageBytes: input.storageBytesOverride ?? baseStorage,
    proSubscriptionActive: planBytes.length > 0,
  };
}

type QuotaRow = {
  storage_bytes_override: number | null;
  granted_plan_variant_id: string | null;
  granted_plan_expires_at: number | null;
};

function grantFromRow(row: QuotaRow | null): GrantedPlan | null {
  return row?.granted_plan_variant_id
    ? {
        variantId: row.granted_plan_variant_id,
        expiresAt: row.granted_plan_expires_at,
      }
    : null;
}

async function getQuotaRow(
  db: D1Database,
  userId: string,
): Promise<QuotaRow | null> {
  return db
    .prepare(
      `SELECT storage_bytes_override, granted_plan_variant_id,
              granted_plan_expires_at
         FROM user_quotas
         WHERE user_id = ?1
         LIMIT 1`,
    )
    .bind(userId)
    .first<QuotaRow>();
}

export async function getActiveGrantedPlan(
  db: D1Database,
  userId: string,
): Promise<GrantedPlan | null> {
  const grant = grantFromRow(await getQuotaRow(db, userId));
  return isGrantActive(grant, Date.now()) ? grant : null;
}

export async function listActiveGrantedUserIds(
  db: D1Database,
): Promise<string[]> {
  const { results } = await db
    .prepare(
      `SELECT user_id FROM user_quotas
         WHERE granted_plan_variant_id IS NOT NULL
           AND (granted_plan_expires_at IS NULL OR granted_plan_expires_at > ?1)`,
    )
    .bind(Date.now())
    .all<{ user_id: string }>();
  return (results ?? []).map((r) => r.user_id);
}

export async function listPaidUserIds(db: D1Database): Promise<string[]> {
  const [subscribed, granted] = await Promise.all([
    listActiveProUserIds(db),
    listActiveGrantedUserIds(db),
  ]);
  return [...new Set([...subscribed, ...granted])];
}

export async function getEffectiveLimitsForUser(
  db: D1Database,
  userId: string,
): Promise<EffectiveLimits> {
  const [row, subscription] = await Promise.all([
    getQuotaRow(db, userId),
    getActiveProSubscription(db, userId),
  ]);
  return resolveEffectiveLimits({
    storageBytesOverride: row?.storage_bytes_override ?? null,
    subscriptionVariantId: subscription?.ls_variant_id ?? null,
    grant: grantFromRow(row),
    nowMs: Date.now(),
  });
}
