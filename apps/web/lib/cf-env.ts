/// <reference types="@cloudflare/workers-types" />

import { getCloudflareContext } from '@opennextjs/cloudflare';

// Centralised binding lookup. Returns the D1 / R2 bindings declared
// in wrangler.toml plus auth secrets, scoped to the current request.
// Returns `null` if invoked outside a Cloudflare runtime (e.g. unit
// tests) so callers can throw a clear error instead of crashing on a
// missing binding deep in a query.

export type AppWebBindings = {
  DB?: D1Database;
  BUCKET?: R2Bucket;
  NEXT_PUBLIC_APP_WEB_SITE_URL?: string;
  NEXT_PUBLIC_SHARE_SITE_URL?: string;
  // Legacy standalone-snap host. The snap viewer lives
  // under `/s` on the marketing root and builds its URLs off
  // NEXT_PUBLIC_MARKETING_SITE_URL; this is retained for parity with the
  // standalone snap worker until cutover.
  NEXT_PUBLIC_SNAP_SITE_URL?: string;
  // Marketing/landing root, read by the share view pages
  // and snap view pages. Set in wrangler.toml
  // [vars]. Snap view URLs are captureflow.xyz/s/<id>.
  NEXT_PUBLIC_MARKETING_SITE_URL?: string;
  // CDN origin for direct R2 reads — share posters/videos and snap PNGs
  // (snaps live under the `snaps/` prefix). Set in wrangler.toml [vars].
  R2_PUBLIC_BASE_URL?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  APP_DEEP_LINK_SCHEME?: string;
  // Lemon Squeezy webhook signing secret. Set in the LS webhook
  // settings; we verify HMAC-SHA256 of the raw request body against
  // the X-Signature header before trusting any subscription event.
  LEMON_WEBHOOK_SECRET?: string;
  // Monthly and annual subscription variant IDs, looked up at webhook
  // time to derive the `cycle` column ('monthly' | 'annual') from
  // LS's variant_id. Strings to match LS's payload encoding. Test-mode
  // variants live in *_TEST_* so a single deployment can accept
  // webhooks from both LS test and live modes during the test purchase
  // flow without flipping secrets.
  LEMON_MONTHLY_VARIANT_ID?: string;
  LEMON_ANNUAL_VARIANT_ID?: string;
  LEMON_TEST_MONTHLY_VARIANT_ID?: string;
  LEMON_TEST_ANNUAL_VARIANT_ID?: string;
  // Resend API key for transactional email (workspace invites). Set via
  // `wrangler secret put RESEND_API_KEY`.
  RESEND_API_KEY?: string;
  // The "from" address Resend sends invite emails as. Must be a verified
  // domain in the Resend account, e.g. "CaptureFlow <hello@captureflow.xyz>".
  RESEND_FROM_ADDRESS?: string;
};

export async function getAppWebEnv(): Promise<AppWebBindings | null> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    return ctx.env as AppWebBindings;
  } catch {
    return null;
  }
}
