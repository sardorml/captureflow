// Single source of truth for account-scoped quotas across CaptureFlow.
//
// The paid tier buys capacity, not features: every feature ships in the
// open-source product, so the free / self-host tier gets a real cloud
// allowance and uploads succeed out of the box. Self-hosters who want
// bigger caps edit these constants or add a `user_quotas` override row.
//
// Per-artifact caps live here too because the upload handlers consult
// them: `perSnap*` is a hard reject on /api/s/upload, `perShare*` is
// enforced at /api/r/init.

export const ACCOUNT_LIMITS = {
  // Free / self-host base allowance. Handlers reject on `used >= limit`,
  // so these gate total usage, not the feature: a free user records &
  // shares normally until 200 MB, then gets the Pro upgrade nudge.
  totalStorageBytes: 200 * 1024 * 1024, // 200 MB
  activeArtifactsPerAccount: 100,

  // A `ready` artifact not viewed in this many days is eligible for GC.
  // Bumped on every view via `bumpLastViewed`.
  retentionDaysFromLastView: 30,

  perShareSizeBytes: 500 * 1024 * 1024,
  // 1h + 2s slack. The 500 MB size cap is the real backstop; duration
  // isn't artificially throttled on the free tier. The slack tolerates
  // an in-spec desktop auto-stop landing final chunks a few hundred ms
  // after the visible countdown hits 0:00.
  perShareDurationMs: 3602 * 1000,

  // 8 MB sits comfortably above a native-resolution Retina display
  // capture (typically ~3-6 MB).
  perSnapSizeBytes: 8 * 1024 * 1024,

  multipartTtlSeconds: 60 * 60,
  presignedPartTtlSeconds: 30 * 60,
} as const;

export type AccountLimits = typeof ACCOUNT_LIMITS;

// Managed paid tier. When a subscription is active the storage cap rises
// to 200 GB and the artifact count is effectively removed, leaving storage
// as the sole limit.
export const PRO_SUBSCRIPTION_LIMITS = {
  totalStorageBytes: 200 * 1024 * 1024 * 1024, // 200 GB
  // Set far above any reachable count so the `activeCount >= limit` upload
  // checks never trip; storage is the only Pro cap.
  activeArtifactsPerAccount: Number.MAX_SAFE_INTEGER,
  // Matches the free tier's duration ceiling; the higher storage cap is
  // what the subscription buys.
  perShareDurationMs: 3602 * 1000,
} as const;
