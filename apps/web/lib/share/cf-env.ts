/// <reference types="@cloudflare/workers-types" />

import { getCloudflareContext } from '@opennextjs/cloudflare';

// Centralised binding lookup. Returns the D1 / R2 / KV bindings declared
// in wrangler.toml, scoped to the current request. Returns `null` if
// invoked outside a Cloudflare runtime (e.g. unit tests, scripts) so
// callers can fall back to in-memory / stub implementations.

export type CloudflareBindings = {
  DB?: D1Database;
  BUCKET?: R2Bucket;
  NEXT_PUBLIC_SHARE_SITE_URL?: string;
  NEXT_PUBLIC_MARKETING_SITE_URL?: string;
  R2_PUBLIC_BASE_URL?: string;
  // Comma-separated device IDs that bypass per-device caps (active
  // shares + total storage). Used so the developer's own device can
  // iterate freely against the deployed worker. Plaintext is fine
  // here — the device id is already long-random and is the auth
  // token for /api/init; if it leaks, the share owner has bigger
  // problems than someone uploading on their behalf.
  DEV_DEVICE_IDS?: string;
};

export async function getCloudflareEnv(): Promise<CloudflareBindings | null> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    return ctx.env as CloudflareBindings;
  } catch {
    return null;
  }
}
