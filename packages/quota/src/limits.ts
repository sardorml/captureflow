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

export const HOSTED_PRODUCT_HOST = "captureflow.dev";

export type SelfHostEnv = {
  BETTER_AUTH_URL?: string;
  CAPTUREFLOW_HOSTED?: string;
};

/*
 * Everything that isn't the product at captureflow.dev is self-hosted: a fork
 * on its own domain, or the Docker image. Self-hosted means no storage cap, no
 * idle-recording sweep and no billing UI. CAPTUREFLOW_HOSTED keeps a local dev
 * server in product mode. With no address to judge by (a test, a bare dev
 * env) it's the product, so nothing redirects by surprise.
 */
export function isSelfHosted(env: SelfHostEnv | null): boolean {
  if (!env?.BETTER_AUTH_URL || env.CAPTUREFLOW_HOSTED === "true") return false;
  try {
    return new URL(env.BETTER_AUTH_URL).hostname !== HOSTED_PRODUCT_HOST;
  } catch {
    return false;
  }
}
