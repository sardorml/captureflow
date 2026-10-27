/// <reference types="@cloudflare/workers-types" />

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { TranscriptionJobMessage } from "./recording/types";

export type AppWebBindings = {
  DB?: D1Database;
  BUCKET?: R2Bucket;
  AI?: Ai;
  TRANSCRIPTION_QUEUE?: Queue<TranscriptionJobMessage>;
  NEXT_PUBLIC_APP_WEB_SITE_URL?: string;
  NEXT_PUBLIC_RECORDING_SITE_URL?: string;
  // Legacy standalone-screenshot host, retained for parity until cutover.
  NEXT_PUBLIC_SCREENSHOT_SITE_URL?: string;
  // Marketing/landing root; screenshot URLs are captureflow.dev/s/<id>.
  NEXT_PUBLIC_MARKETING_SITE_URL?: string;
  // CDN origin for direct R2 reads (screenshots live under the `screenshots/` prefix).
  R2_PUBLIC_BASE_URL?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  APP_WEB_PUBLIC_URL?: string;
  APP_DEEP_LINK_SCHEME?: string;
  // Lemon Squeezy webhook signing secret, used to verify HMAC-SHA256 of the raw body against X-Signature before trusting a subscription event.
  LEMON_WEBHOOK_SECRET?: string;
  // Seat plan variants; a subscription on one of these is a workspace's, not a user's.
  LEMON_LIGHT_MONTHLY_VARIANT_ID?: string;
  LEMON_LIGHT_ANNUAL_VARIANT_ID?: string;
  LEMON_PRO_MONTHLY_VARIANT_ID?: string;
  LEMON_PRO_ANNUAL_VARIANT_ID?: string;
  // Buy links for the seat plans, one per plan and cycle; empty shows the choice without a working button.
  NEXT_PUBLIC_LEMON_LIGHT_MONTHLY_CHECKOUT_URL?: string;
  NEXT_PUBLIC_LEMON_LIGHT_ANNUAL_CHECKOUT_URL?: string;
  NEXT_PUBLIC_LEMON_PRO_MONTHLY_CHECKOUT_URL?: string;
  NEXT_PUBLIC_LEMON_PRO_ANNUAL_CHECKOUT_URL?: string;
  // Lets the app change a seat subscription's quantity when a member joins or leaves. Without it, seat sync only logs.
  LEMON_API_KEY?: string;
  EMAIL?: SendEmail;
  RESEND_API_KEY?: string;
  // Must use a domain verified in both Email Service and Resend, e.g. "CaptureFlow <hello@captureflow.dev>".
  RESEND_FROM_ADDRESS?: string;
  CAPTUREFLOW_EXTENSION_ID?: string;
  SELF_HOSTED?: string;
  ALLOWED_EMAIL_DOMAINS?: string;
};

export async function getAppWebEnv(): Promise<AppWebBindings | null> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    return ctx.env as AppWebBindings;
  } catch {
    return null;
  }
}
