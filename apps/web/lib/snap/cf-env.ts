/// <reference types="@cloudflare/workers-types" />

import { getCloudflareContext } from '@opennextjs/cloudflare';

// Binding lookup for the snap namespace, scoped to the current request.
// Snaps share one D1 + R2 with shares, so DB/BUCKET are the same bindings.
// Returns null outside a Cloudflare runtime (unit tests, scripts) so
// callers can fall back to in-memory stubs.
//
// Session lookup is the exception: see verify-session.ts, which reads
// getAppWebEnv() from @/lib/cf-env directly.

export type SnapCloudflareBindings = {
  DB?: D1Database;
  BUCKET?: R2Bucket;
  NEXT_PUBLIC_SNAP_SITE_URL?: string;
  NEXT_PUBLIC_APP_SITE_URL?: string;
  NEXT_PUBLIC_MARKETING_SITE_URL?: string;
  R2_PUBLIC_BASE_URL?: string;
  // Allowlist of device IDs that bypass the storage quota, so the
  // developer's own device can iterate against the deployed worker
  // without burning the cap.
  DEV_DEVICE_IDS?: string;
};

export async function getCloudflareEnv(): Promise<SnapCloudflareBindings | null> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    return ctx.env as SnapCloudflareBindings;
  } catch {
    return null;
  }
}
