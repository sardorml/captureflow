/*
 * Plan-independent ceilings. What a plan buys lives in seat-plans.ts; these
 * bound every upload whatever the plan.
 */
export const ACCOUNT_LIMITS = {
  retentionDaysFromLastView: 30,

  perScreenshotSizeBytes: 8 * 1024 * 1024,

  multipartTtlSeconds: 60 * 60,
  presignedPartTtlSeconds: 30 * 60,
} as const;

export type AccountLimits = typeof ACCOUNT_LIMITS;

// Finite on purpose: JSON turns Infinity into null, which clients reject.
export const UNLIMITED_STORAGE_BYTES = Number.MAX_SAFE_INTEGER;

/*
 * A self-hosted instance is a company's own tool on its own Cloudflare bill, so
 * it has no storage cap, no idle-recording sweep, and no billing UI.
 */
export function isSelfHosted(env: { SELF_HOSTED?: string } | null): boolean {
  return env?.SELF_HOSTED === "true";
}
