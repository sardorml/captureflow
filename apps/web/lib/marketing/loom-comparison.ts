import { getSeatPlan } from "@captureflow/quota";

export const LOOM_PRICES_CHECKED = "10 October 2026";
export const LOOM_PRICING_URL = "https://www.loom.com/pricing";

export type LoomPlan = "business" | "businessAi";

export const LOOM_PLANS: ReadonlyArray<{
  id: LoomPlan;
  label: string;
  perSeat: number;
}> = [
  { id: "business", label: "Business", perSeat: 18 },
  { id: "businessAi", label: "Business + AI", perSeat: 24 },
];

export const LOOM_BRAND = "Loom";
// Their free tier, kept out of LOOM_PLANS so the paid-plan switch stays paid.
export const LOOM_STARTER = { label: "Starter", maxMembers: 50 } as const;

// Their paid plans are set against Light, the plan with AI at the lower price.
export const CAPTUREFLOW_PLAN = getSeatPlan("light");
export const CAPTUREFLOW_PER_SEAT = CAPTUREFLOW_PLAN.priceMonthlyUsd;

export function getLoomMonthly(plan: LoomPlan, seats: number): number {
  const perSeat = LOOM_PLANS.find((p) => p.id === plan)!.perSeat;
  return perSeat * seats;
}

export function getCaptureflowMonthly(seats: number): number {
  return CAPTUREFLOW_PER_SEAT * seats;
}

export function getYearlySavings(plan: LoomPlan, seats: number): number {
  return Math.max(
    0,
    (getLoomMonthly(plan, seats) - getCaptureflowMonthly(seats)) * 12,
  );
}
