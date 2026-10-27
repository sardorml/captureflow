import { UNLIMITED_STORAGE_BYTES } from "./limits";

const MB = 1024 * 1024;

export type SeatPlanId = "light" | "pro";

export type FreeQuality = "saver";

export type SeatPlan = {
  id: SeatPlanId;
  name: string;
  priceMonthlyUsd: number;
  priceAnnualUsdPerMonth: number;
  // The highest preset the plan records at; null is every preset.
  maxQuality: FreeQuality | null;
  // Chapters, titles and filler removal; transcripts are free everywhere.
  ai: boolean;
};

/*
 * Per-seat pricing. A workspace is the billing unit; every member is a seat.
 * Paid plans have no recording count, length or storage cap. Light keeps the
 * free tier's data saver preset and its AI; Pro records at any quality and
 * adds the AI editing. The free tier is bounded by a recording count, a
 * length and a per-recording byte ceiling sized for the data saver preset.
 */
export const SEAT_PLANS: readonly SeatPlan[] = [
  {
    id: "light",
    name: "Light",
    priceMonthlyUsd: 5,
    priceAnnualUsdPerMonth: 4,
    maxQuality: "saver",
    ai: false,
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthlyUsd: 12,
    priceAnnualUsdPerMonth: 10,
    maxQuality: null,
    ai: true,
  },
];

export const DEFAULT_SEAT_PLAN_ID: SeatPlanId = "light";

// The plan the pricing page and the upgrade dialog point people to.
export const RECOMMENDED_SEAT_PLAN_ID: SeatPlanId = "pro";

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
  ai: boolean;
  // Caps, null where the plan has none.
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
      ai: true,
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
      storageBytes: UNLIMITED_STORAGE_BYTES,
      ai: plan.ai,
      ...UNCAPPED,
      maxQuality: plan.maxQuality,
    };
  }
  return {
    tier: "free",
    plan: null,
    seats: 0,
    storageBytes: UNLIMITED_STORAGE_BYTES,
    ai: false,
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
