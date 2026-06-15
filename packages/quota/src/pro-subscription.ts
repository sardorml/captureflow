/// <reference types="@cloudflare/workers-types" />

// Pro subscription entitlement read-side. The `pro_subscription` table is
// written by the Lemon Squeezy webhook receiver; this
// module is what the rest of the app reads to answer "is user X on an
// active Pro subscription right now?" — gating both the cloud storage cap
// (via getEffectiveLimitsForUser) and the Studio-export entitlement check
// the desktop app makes on sign-in.

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

// LS statuses we treat as "Pro entitlement on". `cancelled` is NOT here —
// after cancellation the user retains access until `current_period_end`,
// which we enforce via the `endsAt` check below, NOT by extending the
// active set. `past_due` is included so a one-day card-decline blip
// doesn't immediately strip Pro; LS escalates to `unpaid` and then
// `expired` after a few retries.
const ACTIVE_STATUSES = new Set<ProSubscriptionStatus>([
  'on_trial',
  'active',
  'past_due',
]);

function isProActive(row: ProSubscriptionRow, nowSeconds: number): boolean {
  if (!ACTIVE_STATUSES.has(row.status)) {
    // A cancelled subscription still entitles the user until the period
    // they've already paid for runs out.
    if (
      row.status === 'cancelled' &&
      row.current_period_end !== null &&
      row.current_period_end > nowSeconds
    ) {
      return true;
    }
    return false;
  }
  // For an explicit active row with a period-end recorded, gate on that
  // so a webhook we missed (LS retries 3×) doesn't strand the entitlement
  // beyond the paid window. NULL period_end means we're in the brief
  // post-create / pre-first-payment window and should grant access.
  if (row.current_period_end === null) return true;
  return row.current_period_end > nowSeconds;
}

// Returns the most recently-updated row for a user. The pro_subscription
// PK is the LS subscription id, not user_id, so a single account can have
// historical cancelled rows alongside an active resubscribe — picking the
// latest by updated_at gives the "current" subscription.
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

// Same as getActiveProSubscription but keyed by email — used by the
// claim flow (user signs in for the first time after purchasing; we
// match their auth email against the LS customer email).
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
