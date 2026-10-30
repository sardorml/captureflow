import type {
  SeatPlanId,
  SubscriptionStatus,
  WorkspaceSubscriptionRow,
} from "@captureflow/quota";

const DAY_S = 86_400;

export type OverridePlan = "free" | SeatPlanId;

export const OVERRIDE_STATUSES = [
  "active",
  "on_trial",
  "past_due",
  "cancelled",
  "paused",
  "unpaid",
] as const satisfies readonly SubscriptionStatus[];

export type OverrideStatus = (typeof OVERRIDE_STATUSES)[number];

export type SubscriptionOverride = {
  plan: OverridePlan;
  status: OverrideStatus;
};

export function hydrateOverride(
  plan: unknown,
  status: unknown,
): SubscriptionOverride | null {
  if (plan !== "free" && plan !== "light" && plan !== "pro") return null;
  const known = OVERRIDE_STATUSES.find((s) => s === status);
  return { plan, status: known ?? "active" };
}

/*
 * The row the override writes. Free is an expired row, which reads as no
 * subscription; a cancelled one still runs to the end of its period, the way a
 * real cancellation does.
 */
export function overrideRowFields(
  override: SubscriptionOverride,
  nowSeconds: number,
): Pick<
  WorkspaceSubscriptionRow,
  "plan" | "status" | "current_period_end" | "cancelled_at"
> {
  if (override.plan === "free") {
    return {
      plan: "light",
      status: "expired",
      current_period_end: nowSeconds - DAY_S,
      cancelled_at: nowSeconds - DAY_S,
    };
  }
  return {
    plan: override.plan,
    status: override.status,
    current_period_end: nowSeconds + 30 * DAY_S,
    cancelled_at: override.status === "cancelled" ? nowSeconds : null,
  };
}

export function readOverride(
  row: Pick<WorkspaceSubscriptionRow, "plan" | "status"> | null,
): SubscriptionOverride | null {
  if (!row) return null;
  if (row.status === "expired") return { plan: "free", status: "active" };
  return hydrateOverride(row.plan, row.status);
}
