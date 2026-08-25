import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/*
 * The panel answers on the public internet, renders no third-party anything and
 * loads no external images, so it can afford the strict policy the app cannot.
 * 'unsafe-inline' on scripts is Next's hydration payload; the value of the
 * directive here is that no external origin can serve script at all.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  transpilePackages: ["@captureflow/admin"],
  // Names the framework and its version to anyone curious which CVEs to try.
  poweredByHeader: false,
  experimental: {
    // Same reason as apps/web: the dev filesystem cache is reloaded on boot, so
    // a stale chunk survives every restart.
    turbopackFileSystemCacheForDev: false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "no-referrer" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
};

/*
 * This worker binds the same D1 as the web worker, so in dev it has to read the
 * same miniflare state too — the schema and its migrations live over there. Its
 * own default state would be an empty database with no tables at all, and every
 * page would 500. Override with CF_DEV_STATE to point somewhere else.
 *
 * Guarded because the helper has no phase check of its own: `next build` loads
 * this file too and boots a miniflare instance against that shared state, where
 * it raced the parallel web build for the same SQLite and lost with
 * SQLITE_BUSY. A build has no use for one — every route here is dynamic, and
 * the only binding reader (lib/env.ts) asks in async mode, which starts its own.
 */
if (process.env.NODE_ENV !== "production") {
  initOpenNextCloudflareForDev({
    persist: { path: process.env.CF_DEV_STATE ?? "../web/.wrangler/state/v3" },
  });
}

export default nextConfig;
