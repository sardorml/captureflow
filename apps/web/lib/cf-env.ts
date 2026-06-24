/// <reference types="@cloudflare/workers-types" />

import { getCloudflareContext } from "@opennextjs/cloudflare";

export type AppWebBindings = {
  DB?: D1Database;
  BUCKET?: R2Bucket;
  NEXT_PUBLIC_APP_WEB_SITE_URL?: string;
  NEXT_PUBLIC_SHARE_SITE_URL?: string;
  // Legacy standalone-snap host, retained for parity until cutover.
  NEXT_PUBLIC_SNAP_SITE_URL?: string;
  // Marketing/landing root; snap URLs are captureflow.xyz/s/<id>.
  NEXT_PUBLIC_MARKETING_SITE_URL?: string;
  // CDN origin for direct R2 reads (snaps live under the `snaps/` prefix).
  R2_PUBLIC_BASE_URL?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  APP_DEEP_LINK_SCHEME?: string;
  // Lemon Squeezy webhook signing secret, used to verify HMAC-SHA256 of the raw body against X-Signature before trusting a subscription event.
  LEMON_WEBHOOK_SECRET?: string;
  // Variant IDs (strings, per LS payload) matched to derive `cycle`. The *_TEST_* variants let one deployment accept LS test- and live-mode webhooks.
  LEMON_MONTHLY_VARIANT_ID?: string;
  LEMON_ANNUAL_VARIANT_ID?: string;
  LEMON_TEST_MONTHLY_VARIANT_ID?: string;
  LEMON_TEST_ANNUAL_VARIANT_ID?: string;
  RESEND_API_KEY?: string;
  // Must use a domain verified in Resend, e.g. "CaptureFlow <hello@captureflow.xyz>".
  RESEND_FROM_ADDRESS?: string;
  // Published browser-extension id. When set, /auth/callback hands the device
  // token only to this extension; unset (dev) accepts any valid-format id.
  CAPTUREFLOW_EXTENSION_ID?: string;
};

export async function getAppWebEnv(): Promise<AppWebBindings | null> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    return ctx.env as AppWebBindings;
  } catch {
    return null;
  }
}
