/// <reference types="@cloudflare/workers-types" />

import type { SeatPlanId } from "./seat-plans";

export type SubscriptionStatus =
  | "on_trial"
  | "active"
  | "paused"
  | "past_due"
  | "unpaid"
  | "cancelled"
  | "expired";

/*
 * `past_due` still counts, so a card-decline blip doesn't strip the plan
 * before billing escalates to `unpaid` or `expired`. `cancelled` runs to the
 * end of the paid period. A null period end is the window before the first
 * payment settles.
 */
const ACTIVE_STATUSES = new Set<SubscriptionStatus>([
  "on_trial",
  "active",
  "past_due",
]);

export function isSubscriptionActive(
  row: { status: SubscriptionStatus; current_period_end: number | null },
  nowSeconds: number,
): boolean {
  if (!ACTIVE_STATUSES.has(row.status)) {
    return (
      row.status === "cancelled" &&
      row.current_period_end !== null &&
      row.current_period_end > nowSeconds
    );
  }
  return row.current_period_end === null || row.current_period_end > nowSeconds;
}

export type WorkspaceSubscriptionRow = {
  ls_subscription_id: string;
  // The subscription item carries the seat count; the quantity update API is addressed by its id.
  ls_subscription_item_id: string | null;
  workspace_id: string | null;
  ls_variant_id: string;
  ls_customer_id: string | null;
  ls_customer_email: string;
  status: SubscriptionStatus;
  plan: SeatPlanId;
  cycle: "monthly" | "annual";
  quantity: number;
  current_period_end: number | null;
  cancelled_at: number | null;
  card_brand: string | null;
  card_last_four: string | null;
  portal_url: string | null;
  update_payment_url: string | null;
  created_at: number;
  updated_at: number;
};

const COLUMNS =
  "ls_subscription_id, ls_subscription_item_id, workspace_id, ls_variant_id, " +
  "ls_customer_id, ls_customer_email, status, plan, cycle, quantity, " +
  "current_period_end, cancelled_at, card_brand, card_last_four, portal_url, " +
  "update_payment_url, created_at, updated_at";

// The latest row for a workspace decides: a cancelled row can sit beside an
// active resubscribe.
export async function getActiveWorkspaceSubscription(
  db: D1Database,
  workspaceId: string,
): Promise<WorkspaceSubscriptionRow | null> {
  const row = await db
    .prepare(
      `SELECT ${COLUMNS} FROM workspace_subscription
        WHERE workspace_id = ?1
        ORDER BY updated_at DESC
        LIMIT 1`,
    )
    .bind(workspaceId)
    .first<WorkspaceSubscriptionRow>();
  if (!row) return null;
  return isSubscriptionActive(row, Math.floor(Date.now() / 1000)) ? row : null;
}

export type WorkspaceSubscriptionUpsert = Omit<
  WorkspaceSubscriptionRow,
  "created_at" | "updated_at"
> & { now: number };

// COALESCE keeps a later event without custom data from detaching the
// workspace.
export async function upsertWorkspaceSubscription(
  db: D1Database,
  row: WorkspaceSubscriptionUpsert,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO workspace_subscription (
         ls_subscription_id, ls_subscription_item_id, workspace_id, ls_variant_id,
         ls_customer_id, ls_customer_email, status, plan, cycle, quantity,
         current_period_end, cancelled_at, card_brand, card_last_four,
         portal_url, update_payment_url, created_at, updated_at
       )
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?14, ?15, ?16, ?17, ?13, ?13)
       ON CONFLICT(ls_subscription_id) DO UPDATE SET
         ls_subscription_item_id = COALESCE(excluded.ls_subscription_item_id, ls_subscription_item_id),
         workspace_id       = COALESCE(excluded.workspace_id, workspace_id),
         ls_variant_id      = excluded.ls_variant_id,
         ls_customer_id     = excluded.ls_customer_id,
         ls_customer_email  = excluded.ls_customer_email,
         status             = excluded.status,
         plan               = excluded.plan,
         cycle              = excluded.cycle,
         quantity           = excluded.quantity,
         current_period_end = excluded.current_period_end,
         cancelled_at       = excluded.cancelled_at,
         card_brand         = COALESCE(excluded.card_brand, card_brand),
         card_last_four     = COALESCE(excluded.card_last_four, card_last_four),
         portal_url         = COALESCE(excluded.portal_url, portal_url),
         update_payment_url = COALESCE(excluded.update_payment_url, update_payment_url),
         updated_at         = excluded.updated_at`,
    )
    .bind(
      row.ls_subscription_id,
      row.ls_subscription_item_id,
      row.workspace_id,
      row.ls_variant_id,
      row.ls_customer_id,
      row.ls_customer_email,
      row.status,
      row.plan,
      row.cycle,
      row.quantity,
      row.current_period_end,
      row.cancelled_at,
      row.now,
      row.card_brand,
      row.card_last_four,
      row.portal_url,
      row.update_payment_url,
    )
    .run();
}

// Seat sync writes the count it just pushed to billing, so the entitlement
// follows at once instead of waiting for the webhook to echo it back.
export async function setWorkspaceSubscriptionQuantity(
  db: D1Database,
  lsSubscriptionId: string,
  quantity: number,
): Promise<void> {
  await db
    .prepare(
      `UPDATE workspace_subscription
          SET quantity = ?2, updated_at = ?3
        WHERE ls_subscription_id = ?1`,
    )
    .bind(lsSubscriptionId, quantity, Math.floor(Date.now() / 1000))
    .run();
}

// Workspaces whose latest subscription row is still active: the idle sweep
// leaves their captures alone.
export async function listPaidWorkspaceIds(db: D1Database): Promise<string[]> {
  const { results } = await db
    .prepare(
      `SELECT ${COLUMNS} FROM workspace_subscription
        WHERE workspace_id IS NOT NULL
        ORDER BY updated_at DESC`,
    )
    .all<WorkspaceSubscriptionRow>();
  const now = Math.floor(Date.now() / 1000);
  const seen = new Set<string>();
  const paid: string[] = [];
  for (const row of results ?? []) {
    const id = row.workspace_id as string;
    if (seen.has(id)) continue;
    seen.add(id);
    if (isSubscriptionActive(row, now)) paid.push(id);
  }
  return paid;
}
