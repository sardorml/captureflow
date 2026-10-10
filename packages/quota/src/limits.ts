/*
 * Storage is the only ceiling, full stop: no clock, no per-recording byte cap,
 * and no cap on how many artifacts an account keeps. A single recording may
 * fill whatever is left, so what a tier buys is space — one number, which the
 * client stops on rather than discovering at upload.
 */
export const ACCOUNT_LIMITS = {
  totalStorageBytes: 200 * 1024 * 1024,
  retentionDaysFromLastView: 30,

  perScreenshotSizeBytes: 8 * 1024 * 1024,

  multipartTtlSeconds: 60 * 60,
  presignedPartTtlSeconds: 30 * 60,
} as const;

export type AccountLimits = typeof ACCOUNT_LIMITS;

const GB = 1024 * 1024 * 1024;

// Each Lemon Squeezy variant buys one storage size. The variant id is what the
// webhook records, so it is the only thing that can decide the cap.
export const STORAGE_PLANS = [
  { variantId: "1849420", storageGb: 100, label: "100 GB" },
  { variantId: "1849425", storageGb: 500, label: "500 GB" },
  { variantId: "1828191", storageGb: 1024, label: "1 TB" },
] as const;

export type StoragePlan = (typeof STORAGE_PLANS)[number];

// An unrecognised variant (a self-hosted store, a test-mode product) gets the
// smallest paid plan rather than the largest.
export function storageBytesForVariant(variantId: string): number {
  const plan =
    STORAGE_PLANS.find((p) => p.variantId === variantId) ?? STORAGE_PLANS[0];
  return plan.storageGb * GB;
}
