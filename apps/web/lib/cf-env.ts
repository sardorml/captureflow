/// <reference types="@cloudflare/workers-types" />

import { getCloudflareContext } from '@opennextjs/cloudflare';

// Centralised, request-scoped binding lookup (D1 / R2 plus auth secrets
// from wrangler.toml). Returns `null` outside a Cloudflare runtime (e.g.
// unit tests) so callers can throw a clear error instead of crashing on
// a missing binding deep in a query.

export type AppWebBindings = {
  DB?: D1Database;
  BUCKET?: R2Bucket;
  NEXT_PUBLIC_APP_WEB_SITE_URL?: string;
  NEXT_PUBLIC_SHARE_SITE_URL?: string;
  // Legacy standalone-snap host. The snap viewer now lives under `/s` on
  // the marketing root and builds URLs off NEXT_PUBLIC_MARKETING_SITE_URL;
  // retained for parity with the standalone snap worker until cutover.
  NEXT_PUBLIC_SNAP_SITE_URL?: string;
  // Marketing/landing root, read by the share and snap view pages
  // (snap URLs are captureflow.xyz/s/<id>). Set in wrangler.toml [vars].
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
  // Subscription variant IDs, matched against LS's variant_id at webhook
  // time to derive the `cycle` column ('monthly' | 'annual'). Strings to
  // match LS's payload encoding. The *_TEST_* variants let one deployment
  // accept both LS test- and live-mode webhooks without flipping secrets.
  LEMON_MONTHLY_VARIANT_ID?: string;
  LEMON_ANNUAL_VARIANT_ID?: string;
  LEMON_TEST_MONTHLY_VARIANT_ID?: string;
  LEMON_TEST_ANNUAL_VARIANT_ID?: string;
  // Resend API key for transactional email (workspace invites). Set via
  // `wrangler secret put RESEND_API_KEY`.
  RESEND_API_KEY?: string;
  // "From" address for invite emails. Must use a domain verified in the
  // Resend account, e.g. "CaptureFlow <hello@captureflow.xyz>".
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
