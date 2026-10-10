import { LANDING_STORAGE_TIERS } from "./constants";

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

const LARGEST_TIER = LANDING_STORAGE_TIERS[LANDING_STORAGE_TIERS.length - 1]!;

export const CAPTUREFLOW_MONTHLY = Number(LARGEST_TIER.price);
export const CAPTUREFLOW_STORAGE_LABEL = LARGEST_TIER.label;

export function getLoomMonthly(plan: LoomPlan, seats: number): number {
  const perSeat = LOOM_PLANS.find((p) => p.id === plan)!.perSeat;
  return perSeat * seats;
}

export function getYearlySavings(plan: LoomPlan, seats: number): number {
  return Math.max(0, (getLoomMonthly(plan, seats) - CAPTUREFLOW_MONTHLY) * 12);
}
