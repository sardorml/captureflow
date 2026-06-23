/// <reference types="@cloudflare/workers-types" />

export type ProSubscriptionStatus =
  | 'on_trial'
  | 'active'
  | 'paused'
  | 'past_due'
  | 'unpaid'
  | 'cancelled'
  | 'expired';

export type ProSubscriptionRow = {
  ls_subscription_id: string;
  user_id: string | null;
  ls_variant_id: string;
  ls_customer_id: string | null;
  ls_customer_email: string;
  status: ProSubscriptionStatus;
  cycle: 'monthly' | 'annual';
  current_period_end: number | null;
  cancelled_at: number | null;
  created_at: number;
  updated_at: number;
};

// `cancelled` is excluded — access runs to current_period_end, enforced below. `past_due` is included so a card-decline blip doesn't strip Pro before LS escalates to `unpaid`/`expired`.
const ACTIVE_STATUSES = new Set<ProSubscriptionStatus>([
  'on_trial',
  'active',
  'past_due',
]);

function isProActive(row: ProSubscriptionRow, nowSeconds: number): boolean {
  if (!ACTIVE_STATUSES.has(row.status)) {
    if (
      row.status === 'cancelled' &&
      row.current_period_end !== null &&
      row.current_period_end > nowSeconds
    ) {
      return true;
    }
    return false;
  }
  // Gate on period-end so a missed webhook (LS retries 3×) can't strand entitlement past the paid window. NULL = pre-first-payment window, grant access.
  if (row.current_period_end === null) return true;
  return row.current_period_end > nowSeconds;
}

// PK is the LS subscription id, so one account can have historical cancelled rows alongside an active resubscribe; the latest by updated_at is the current one.
export async function getActiveProSubscription(
  db: D1Database,
  userId: string
): Promise<ProSubscriptionRow | null> {
  const row = await db
    .prepare(
      `SELECT ls_subscription_id, user_id, ls_variant_id, ls_customer_id,
              ls_customer_email, status, cycle, current_period_end,
              cancelled_at, created_at, updated_at
         FROM pro_subscription
         WHERE user_id = ?1
         ORDER BY updated_at DESC
         LIMIT 1`
    )
    .bind(userId)
    .first<ProSubscriptionRow>();
  if (!row) return null;
  const now = Math.floor(Date.now() / 1000);
  return isProActive(row, now) ? row : null;
}

export async function getUnclaimedProSubscriptionByEmail(
  db: D1Database,
  email: string
): Promise<ProSubscriptionRow | null> {
  const row = await db
    .prepare(
      `SELECT ls_subscription_id, user_id, ls_variant_id, ls_customer_id,
              ls_customer_email, status, cycle, current_period_end,
              cancelled_at, created_at, updated_at
         FROM pro_subscription
         WHERE LOWER(ls_customer_email) = LOWER(?1)
           AND user_id IS NULL
         ORDER BY updated_at DESC
         LIMIT 1`
    )
    .bind(email)
    .first<ProSubscriptionRow>();
  return row ?? null;
}

export async function attachSubscriptionToUser(
  db: D1Database,
  lsSubscriptionId: string,
  userId: string
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `UPDATE pro_subscription
         SET user_id = ?1, updated_at = ?2
         WHERE ls_subscription_id = ?3`
    )
    .bind(userId, now, lsSubscriptionId)
    .run();
}
