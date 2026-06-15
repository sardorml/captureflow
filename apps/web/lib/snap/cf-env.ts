/// <reference types="@cloudflare/workers-types" />

import { getCloudflareContext } from '@opennextjs/cloudflare';

// Centralised binding lookup for the snap namespace.
// Same pattern as lib/share/cf-env.ts — returns the D1 / R2 / env
// bindings declared in app-web's wrangler.toml, scoped to the current
// request. The app shares one D1 + R2 with shares, so these are
// the same DB/BUCKET bindings; this wrapper keeps the snap lib's
// relative `./cf-env` imports working unchanged. Returns `null` when
// invoked outside a Cloudflare runtime (unit tests, scripts) so callers
// can fall back to in-memory stubs.
//
// The session lookup uses the app-web convention instead — see
// lib/snap/verify-session.ts, which reads getAppWebEnv() from
// @/lib/cf-env directly.

export type SnapCloudflareBindings = {
  DB?: D1Database;
  BUCKET?: R2Bucket;
  NEXT_PUBLIC_SNAP_SITE_URL?: string;
  NEXT_PUBLIC_APP_SITE_URL?: string;
  NEXT_PUBLIC_MARKETING_SITE_URL?: string;
  R2_PUBLIC_BASE_URL?: string;
  // Allowlist of device IDs that bypass the storage quota — used so
  // the developer's own device can iterate against the deployed
  // worker without burning the cap. Mirrors the share behaviour.
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
