export const ACCOUNT_LIMITS = {
  totalStorageBytes: 200 * 1024 * 1024,
  activeArtifactsPerAccount: 100,
  retentionDaysFromLastView: 30,

  perShareSizeBytes: 500 * 1024 * 1024,
  // 1h + 2s slack: tolerates a desktop auto-stop landing final chunks a few hundred ms after the countdown hits 0:00.
  perShareDurationMs: 3602 * 1000,

  perSnapSizeBytes: 8 * 1024 * 1024,

  multipartTtlSeconds: 60 * 60,
  presignedPartTtlSeconds: 30 * 60,
} as const;

export type AccountLimits = typeof ACCOUNT_LIMITS;

export const PRO_SUBSCRIPTION_LIMITS = {
  totalStorageBytes: 200 * 1024 * 1024 * 1024,
  activeArtifactsPerAccount: Number.MAX_SAFE_INTEGER,
  perShareDurationMs: 3602 * 1000,
} as const;
