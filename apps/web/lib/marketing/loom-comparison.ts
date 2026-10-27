import {
  getSeatPlan,
  type SeatPlan,
  type SeatPlanId,
} from "@captureflow/quota";

export const LOOM_PRICES_CHECKED = "10 October 2026";
export const LOOM_PRICING_URL = "https://www.loom.com/pricing";

export type LoomPlan = "business" | "businessAi";

// Each of their paid plans is set against the plan of ours that matches it.
export const LOOM_PLANS: ReadonlyArray<{
  id: LoomPlan;
  label: string;
  perSeat: number;
  ours: SeatPlanId;
}> = [
  { id: "business", label: "Business", perSeat: 18, ours: "light" },
  { id: "businessAi", label: "Business + AI", perSeat: 24, ours: "pro" },
];

export const LOOM_BRAND = "Loom";
// Their free tier, kept out of LOOM_PLANS so the paid-plan switch stays paid.
export const LOOM_STARTER = { label: "Starter", maxMembers: 50 } as const;

export const CAPTUREFLOW_PER_SEAT = getSeatPlan("light").priceMonthlyUsd;

export function ourPlanFor(plan: LoomPlan): SeatPlan {
  return getSeatPlan(LOOM_PLANS.find((p) => p.id === plan)!.ours);
}

export function getLoomMonthly(plan: LoomPlan, seats: number): number {
  const perSeat = LOOM_PLANS.find((p) => p.id === plan)!.perSeat;
  return perSeat * seats;
}

export function getCaptureflowMonthly(plan: LoomPlan, seats: number): number {
  return ourPlanFor(plan).priceMonthlyUsd * seats;
}

export function getYearlySavings(plan: LoomPlan, seats: number): number {
  return Math.max(
    0,
    (getLoomMonthly(plan, seats) - getCaptureflowMonthly(plan, seats)) * 12,
  );
}
