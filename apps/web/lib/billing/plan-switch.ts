/// <reference types="@cloudflare/workers-types" />

import {
  getActiveWorkspaceSubscription,
  setSubscriptionVariant,
  setWorkspaceSubscriptionPlan,
  type SeatPlanId,
} from "@captureflow/quota";
import { DEV_SUBSCRIPTION_PREFIX } from "./seat-sync";
import { variantIdFor, type SeatVariantEnv } from "./variants";

export type PlanSwitchEnv = SeatVariantEnv & {
  DB: D1Database;
  LEMON_API_KEY?: string;
};

type PlanSwitchFailure =
  | "noSubscription"
  | "cancelled"
  | "unavailable"
  | "rejected";

export type PlanSwitchResult =
  | { ok: true }
  | { ok: false; reason: PlanSwitchFailure };

/*
 * Moves a paid workspace to another plan on the same billing cycle. Seats and
 * the renewal date stay; Lemon Squeezy adds the price difference for the rest
 * of the period to the next invoice.
 */
export async function switchWorkspacePlan(
  env: PlanSwitchEnv,
  args: { workspaceId: string; plan: SeatPlanId },
): Promise<PlanSwitchResult> {
  const subscription = await getActiveWorkspaceSubscription(
    env.DB,
    args.workspaceId,
  );
  if (!subscription) return { ok: false, reason: "noSubscription" };
  if (subscription.cancelled_at !== null) {
    return { ok: false, reason: "cancelled" };
  }
  if (subscription.plan === args.plan) return { ok: true };

  const target = { plan: args.plan, cycle: subscription.cycle };
  if (subscription.ls_subscription_id.startsWith(DEV_SUBSCRIPTION_PREFIX)) {
    await setWorkspaceSubscriptionPlan(env.DB, {
      lsSubscriptionId: subscription.ls_subscription_id,
      plan: args.plan,
      variantId: `${DEV_SUBSCRIPTION_PREFIX}${args.plan}-${subscription.cycle}`,
    });
    return { ok: true };
  }

  const variantId = variantIdFor(env, target);
  if (!variantId || !env.LEMON_API_KEY) {
    console.error(
      `[plan-switch] missing ${variantId ? "LEMON_API_KEY" : `variant for ${args.plan} ${subscription.cycle}`}`,
    );
    return { ok: false, reason: "unavailable" };
  }
  const result = await setSubscriptionVariant({
    apiKey: env.LEMON_API_KEY,
    subscriptionId: subscription.ls_subscription_id,
    variantId,
  });
  if (!result.ok) {
    console.error(
      `[plan-switch] workspace ${args.workspaceId}: ${result.status} ${result.body.slice(0, 200)}`,
    );
    return { ok: false, reason: "rejected" };
  }
  await setWorkspaceSubscriptionPlan(env.DB, {
    lsSubscriptionId: subscription.ls_subscription_id,
    plan: args.plan,
    variantId,
  });
  return { ok: true };
}
