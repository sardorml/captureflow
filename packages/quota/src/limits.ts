// Single source of truth for account-scoped quotas across CaptureFlow.
//
// OPEN-CORE MODEL: every feature ships in the open-source product, so the
// FREE / self-host tier gets a real cloud allowance — uploads succeed out
// of the box. The managed paid tier (PRO_SUBSCRIPTION_LIMITS) buys more
// capacity (storage + active artifacts), not features. A self-hoster who
// wants bigger caps just edits these constants (or adds a `user_quotas`
// override row); there is no feature gate to remove.
//
// Per-artifact caps are listed alongside because they're consulted by the
// same upload handlers. The `perSnap*` cap is a hard reject on
// /api/s/upload; `perShare*` is enforced at /api/r/init.
//
// Override rows in the `user_quotas` table can lift the two account-scoped
// caps on a per-user basis (admin / dashboard).

export const ACCOUNT_LIMITS = {
  // Free / self-host base allowance. Real, non-zero caps so Share & Snap
  // uploads work without any subscription. The upload handlers reject on
  // `used >= limit`, so these gate total usage, not the feature itself —
  // a free user records & shares normally until they reach 200 MB, at
  // which point the toolbar nudge + dashboard prompt the Pro upgrade.
  totalStorageBytes: 200 * 1024 * 1024, // 200 MB
  activeArtifactsPerAccount: 100,

  // Retention: a `ready` artifact (share or snap) that hasn't been
  // viewed in this many days is eligible for GC. Bumped on every view
  // via `bumpLastViewed`.
  retentionDaysFromLastView: 30,

  // Per-share (video) caps.
  perShareSizeBytes: 500 * 1024 * 1024,
  // 1h + 2s slack. The per-share size cap (500 MB) is the real backstop;
  // duration isn't artificially throttled on the free tier. The 2s slack
  // tolerates an in-spec desktop auto-stop landing final chunks a few
  // hundred ms after the visible countdown hits 0:00.
  perShareDurationMs: 3602 * 1000,

  // Per-snap (image) caps. PNGs cap at 8 MB — comfortably above a
  // native-resolution Retina display capture (typical ~3-6 MB).
  perSnapSizeBytes: 8 * 1024 * 1024,

  // Upload mechanics (multipart shares).
  multipartTtlSeconds: 60 * 60,
  presignedPartTtlSeconds: 30 * 60,
} as const;

export type AccountLimits = typeof ACCOUNT_LIMITS;

// Managed paid tier (Monthly / Annual on the hosted cloud). Stacks on top
// of ACCOUNT_LIMITS — when a subscription is active, the storage cap is
// lifted to 200 GB and the active-artifact count is effectively removed, so
// storage is the ONLY cap. This is a CAPACITY tier, not a feature unlock:
// the same code self-hosts for free with ACCOUNT_LIMITS.
export const PRO_SUBSCRIPTION_LIMITS = {
  totalStorageBytes: 200 * 1024 * 1024 * 1024, // 200 GB
  // No cap on the number of active shares / Snaps for subscribers — set far
  // above any reachable count so the `activeCount >= limit` upload checks
  // never trip. Storage (above) is the sole Pro limit.
  activeArtifactsPerAccount: Number.MAX_SAFE_INTEGER,
  // Matches the free tier's duration ceiling; the higher storage cap is what
  // the subscription buys.
  perShareDurationMs: 3602 * 1000,
} as const;
