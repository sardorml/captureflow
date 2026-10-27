/// <reference types="@cloudflare/workers-types" />

// Hand-maintained for now; regenerate with `pnpm --filter @captureflow/web cf:typegen`
// after editing wrangler.jsonc.
interface CloudflareEnv {
  // Bindings (see wrangler.jsonc).
  ASSETS: Fetcher;
  DB: D1Database;
  BUCKET: R2Bucket;

  // Vars.
  NEXT_PUBLIC_APP_WEB_SITE_URL: string;
  NEXT_PUBLIC_RECORDING_SITE_URL: string;
  NEXT_PUBLIC_SCREENSHOT_SITE_URL: string;
  NEXT_PUBLIC_MARKETING_SITE_URL: string;
  R2_PUBLIC_BASE_URL: string;
  BETTER_AUTH_URL: string;
  APP_DEEP_LINK_SCHEME: string;
  NEXT_PUBLIC_LEMON_LIGHT_MONTHLY_CHECKOUT_URL?: string;
  NEXT_PUBLIC_LEMON_LIGHT_ANNUAL_CHECKOUT_URL?: string;
  NEXT_PUBLIC_LEMON_PRO_MONTHLY_CHECKOUT_URL?: string;
  NEXT_PUBLIC_LEMON_PRO_ANNUAL_CHECKOUT_URL?: string;
  LEMON_LIGHT_MONTHLY_VARIANT_ID?: string;
  LEMON_LIGHT_ANNUAL_VARIANT_ID?: string;
  LEMON_PRO_MONTHLY_VARIANT_ID?: string;
  LEMON_PRO_ANNUAL_VARIANT_ID?: string;
  SELF_HOSTED?: string;
  ALLOWED_EMAIL_DOMAINS?: string;

  // Secrets (set via `wrangler secret put`, or `.dev.vars` in local dev).
  BETTER_AUTH_SECRET: string;
  LEMON_WEBHOOK_SECRET?: string;
}
