/// <reference types="@cloudflare/workers-types" />

import {
  countWorkspaceSeats,
  getActiveWorkspaceSubscription,
  isSelfHosted,
  recordSeatChange,
  setSubscriptionItemQuantity,
  setWorkspaceSubscriptionQuantity,
} from "@captureflow/quota";

// The fake checkout's subscriptions, which have no Lemon Squeezy side.
export const DEV_SUBSCRIPTION_PREFIX = "dev-";

export type SeatSyncEnv = {
  DB: D1Database;
  LEMON_API_KEY?: string;
  SELF_HOSTED?: string;
};

/*
 * Pushes the seat count to billing as the subscription quantity. Best-effort
 * by design: a failed call is logged and the member change stands, since
 * billing must never block someone joining a team; the daily cron retries.
 * Without an API key (local dev, self-hosted) it only reports what it would
 * have done. Takes the env so the worker's cron can call it too.
 */
export async function syncSeatsWithBilling(
  env: SeatSyncEnv,
  workspaceId: string,
): Promise<void> {
  if (isSelfHosted(env)) return;
  const subscription = await getActiveWorkspaceSubscription(
    env.DB,
    workspaceId,
  );
  if (!subscription) return;
  const seats = Math.max(1, await countWorkspaceSeats(env.DB, workspaceId));
  if (seats === subscription.quantity) return;

  if (subscription.ls_subscription_id.startsWith(DEV_SUBSCRIPTION_PREFIX)) {
    await setWorkspaceSubscriptionQuantity(
      env.DB,
      subscription.ls_subscription_id,
      seats,
    );
    await logSeatChange(env.DB, subscription, seats);
    return;
  }

  if (!env.LEMON_API_KEY || !subscription.ls_subscription_item_id) {
    console.info(
      `[seats] workspace ${workspaceId}: would set quantity ${subscription.quantity} → ${seats} (no LEMON_API_KEY or item id)`,
    );
    return;
  }
  const result = await setSubscriptionItemQuantity({
    apiKey: env.LEMON_API_KEY,
    subscriptionItemId: subscription.ls_subscription_item_id,
    quantity: seats,
  });
  if (!result.ok) {
    console.error(
      `[seats] workspace ${workspaceId}: quantity update failed ${result.status}: ${result.body.slice(0, 200)}`,
    );
    return;
  }
  await setWorkspaceSubscriptionQuantity(
    env.DB,
    subscription.ls_subscription_id,
    seats,
  );
  await logSeatChange(env.DB, subscription, seats);
}

// Only for the billing page's estimate, so a failed write is just logged.
async function logSeatChange(
  db: D1Database,
  subscription: { ls_subscription_id: string; quantity: number },
  seats: number,
): Promise<void> {
  try {
    await recordSeatChange(db, {
      subscriptionId: subscription.ls_subscription_id,
      from: subscription.quantity,
      to: seats,
      at: Date.now(),
    });
  } catch (error) {
    console.warn("[seats] seat change not logged", error);
  }
}
