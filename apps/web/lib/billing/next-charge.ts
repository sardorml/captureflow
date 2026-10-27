import {
  getSeatPlan,
  type SeatChange,
  type SeatPlanId,
} from "@captureflow/quota";

export type NextCharge = {
  base: number;
  prorated: number;
  total: number;
  seatsAdded: number;
  seatsRemoved: number;
};

export function periodStartOf(
  periodEndMs: number,
  cycle: "monthly" | "annual",
): number {
  const start = new Date(periodEndMs);
  if (cycle === "annual") start.setUTCFullYear(start.getUTCFullYear() - 1);
  else start.setUTCMonth(start.getUTCMonth() - 1);
  return start.getTime();
}

function cents(n: number): number {
  return Math.round(n * 100) / 100;
}

/*
 * Lemon Squeezy prorates each mid-period seat change onto the next invoice:
 * an added seat costs its share of the period that's left, a removed one is
 * credited the same way. This mirrors that from our own log of changes, so
 * it can be a few cents off the real invoice.
 */
export function estimateNextCharge(args: {
  plan: SeatPlanId;
  cycle: "monthly" | "annual";
  quantity: number;
  periodEndMs: number;
  changes: SeatChange[];
}): NextCharge {
  const seatPlan = getSeatPlan(args.plan);
  const perSeat =
    args.cycle === "annual"
      ? seatPlan.priceAnnualUsdPerMonth * 12
      : seatPlan.priceMonthlyUsd;
  const start = periodStartOf(args.periodEndMs, args.cycle);
  const length = args.periodEndMs - start;

  let prorated = 0;
  let seatsAdded = 0;
  let seatsRemoved = 0;
  for (const change of args.changes) {
    if (change.changed_at < start || change.changed_at >= args.periodEndMs) {
      continue;
    }
    const delta = change.to_quantity - change.from_quantity;
    const left = (args.periodEndMs - change.changed_at) / length;
    prorated += delta * perSeat * left;
    if (delta > 0) seatsAdded += delta;
    else seatsRemoved -= delta;
  }

  const base = args.quantity * perSeat;
  return {
    base,
    prorated: cents(prorated),
    total: cents(base + prorated),
    seatsAdded,
    seatsRemoved,
  };
}
