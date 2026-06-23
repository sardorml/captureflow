/// <reference types="@cloudflare/workers-types" />

import { getCloudflareContext } from '@opennextjs/cloudflare';

// Centralised binding lookup. Returns the wrangler.toml bindings scoped to
// the current request, or `null` outside a Cloudflare runtime (unit tests,
// scripts) so callers can fall back to in-memory / stub implementations.

export type CloudflareBindings = {
  DB?: D1Database;
  BUCKET?: R2Bucket;
  NEXT_PUBLIC_SHARE_SITE_URL?: string;
  NEXT_PUBLIC_MARKETING_SITE_URL?: string;
  R2_PUBLIC_BASE_URL?: string;
  // Comma-separated device IDs that bypass per-device caps (active shares +
  // total storage), so a dev device can iterate against the deployed worker.
  // Plaintext is fine: the device id is already long-random and is itself the
  // /api/init auth token, so a leak gains nothing beyond uploading as that id.
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
