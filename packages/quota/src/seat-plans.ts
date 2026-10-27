import { UNLIMITED_STORAGE_BYTES } from "./limits";

const MB = 1024 * 1024;
const GB = 1024 * MB;

export type SeatPlanId = "light" | "pro";

export type SeatPlan = {
  id: SeatPlanId;
  name: string;
  priceMonthlyUsd: number;
  priceAnnualUsdPerMonth: number;
  storageBytesPerSeat: number;
};

/*
 * Per-seat pricing. A workspace is the billing unit; every member is a seat.
 * Both paid plans lift every free cap and include the AI features; Pro adds
 * room, branding and priority support. Paid seats pool their storage. The
 * free tier has no storage pool: its space is bounded by a recording count, a
 * length and a per-recording byte ceiling sized for the data saver preset.
 */
export const SEAT_PLANS: readonly SeatPlan[] = [
  {
    id: "light",
    name: "Light",
    priceMonthlyUsd: 5,
    priceAnnualUsdPerMonth: 4,
    storageBytesPerSeat: 10 * GB,
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthlyUsd: 12,
    priceAnnualUsdPerMonth: 10,
    storageBytesPerSeat: 50 * GB,
  },
];

export const DEFAULT_SEAT_PLAN_ID: SeatPlanId = "light";

export function getSeatPlan(id: SeatPlanId): SeatPlan {
  return SEAT_PLANS.find((p) => p.id === id)!;
}

export function isSeatPlanId(value: unknown): value is SeatPlanId {
  return SEAT_PLANS.some((p) => p.id === value);
}

export function hydrateSeatPlanId(raw: unknown): SeatPlanId {
  return isSeatPlanId(raw) ? raw : DEFAULT_SEAT_PLAN_ID;
}

export function seatAnnualSavingPercent(plan: SeatPlan): number {
  return Math.round(
    (1 - plan.priceAnnualUsdPerMonth / plan.priceMonthlyUsd) * 100,
  );
}

export const SEAT_ANNUAL_SAVING_PERCENT = Math.max(
  ...SEAT_PLANS.map(seatAnnualSavingPercent),
);

export type FreeQuality = "saver";

/*
 * maxRecordingBytes covers five minutes at the data saver ceilings in
 * packages/engine/src/quality.ts (750 kbps screen + 48 kbps audio, 200 kbps
 * webcam + 48 kbps audio ≈ 39 MB) with room for container overhead; the
 * recorder stops on the same number.
 */
export const FREE_TIER = {
  recordingsPerPerson: 25,
  maxRecordingMs: 5 * 60 * 1000,
  maxRecordingBytes: 50 * MB,
  quality: "saver" as FreeQuality,
} as const;

export type WorkspaceTier = "free" | "team";

export type WorkspaceEntitlement = {
  tier: WorkspaceTier;
  // Null on the free tier and when self-hosted.
  plan: SeatPlanId | null;
  seats: number;
  storageBytes: number;
  // Free-tier caps, null once paid.
  recordingsPerPerson: number | null;
  maxRecordingMs: number | null;
  maxRecordingBytes: number | null;
  maxQuality: FreeQuality | null;
};

export type SeatSubscriptionInput = {
  quantity: number;
  plan: SeatPlanId;
};

const UNCAPPED = {
  recordingsPerPerson: null,
  maxRecordingMs: null,
  maxRecordingBytes: null,
  maxQuality: null,
} as const;

export function resolveWorkspaceEntitlement(input: {
  subscription: SeatSubscriptionInput | null;
  memberCount: number;
  selfHosted?: boolean;
}): WorkspaceEntitlement {
  if (input.selfHosted) {
    return {
      tier: "team",
      plan: null,
      seats: Math.max(1, input.memberCount),
      storageBytes: UNLIMITED_STORAGE_BYTES,
      ...UNCAPPED,
    };
  }

  const seats = input.subscription
    ? Math.max(1, input.subscription.quantity)
    : 0;
  if (input.subscription && seats > 0) {
    const plan = getSeatPlan(input.subscription.plan);
    return {
      tier: "team",
      plan: plan.id,
      seats,
      storageBytes: seats * plan.storageBytesPerSeat,
      ...UNCAPPED,
    };
  }
  return {
    tier: "free",
    plan: null,
    seats: 0,
    storageBytes: UNLIMITED_STORAGE_BYTES,
    recordingsPerPerson: FREE_TIER.recordingsPerPerson,
    maxRecordingMs: FREE_TIER.maxRecordingMs,
    maxRecordingBytes: FREE_TIER.maxRecordingBytes,
    maxQuality: FREE_TIER.quality,
  };
}

export function seatPriceUsd(
  seats: number,
  cycle: "monthly" | "annual",
  planId: SeatPlanId = DEFAULT_SEAT_PLAN_ID,
): number {
  const plan = getSeatPlan(planId);
  const perSeat =
    cycle === "annual" ? plan.priceAnnualUsdPerMonth : plan.priceMonthlyUsd;
  return Math.max(1, seats) * perSeat;
}
