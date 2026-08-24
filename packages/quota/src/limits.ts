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

export const PRO_SUBSCRIPTION_LIMITS = {
  totalStorageBytes: 200 * 1024 * 1024 * 1024,
} as const;
