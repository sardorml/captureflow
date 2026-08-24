/*
 * Storage is the only ceiling on a recording: no clock, and no per-recording
 * byte cap. A single recording may fill whatever the account has left, so what
 * a tier buys is space rather than minutes — and the client stops on the same
 * number rather than discovering it at upload.
 */
export const ACCOUNT_LIMITS = {
  totalStorageBytes: 200 * 1024 * 1024,
  activeArtifactsPerAccount: 100,
  retentionDaysFromLastView: 30,

  perScreenshotSizeBytes: 8 * 1024 * 1024,

  multipartTtlSeconds: 60 * 60,
  presignedPartTtlSeconds: 30 * 60,
} as const;

export type AccountLimits = typeof ACCOUNT_LIMITS;

export const PRO_SUBSCRIPTION_LIMITS = {
  totalStorageBytes: 200 * 1024 * 1024 * 1024,
  activeArtifactsPerAccount: Number.MAX_SAFE_INTEGER,
} as const;
