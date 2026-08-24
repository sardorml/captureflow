import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  transpilePackages: ["@captureflow/admin"],
  experimental: {
    // Same reason as apps/web: the dev filesystem cache is reloaded on boot, so
    // a stale chunk survives every restart.
    turbopackFileSystemCacheForDev: false,
  },
};

/*
 * This worker binds the same D1 as the web worker, so in dev it has to read the
 * same miniflare state too — the schema and its migrations live over there. Its
 * own default state would be an empty database with no tables at all, and every
 * page would 500. Override with CF_DEV_STATE to point somewhere else.
 */
initOpenNextCloudflareForDev({
  persist: { path: process.env.CF_DEV_STATE ?? "../web/.wrangler/state/v3" },
});

export default nextConfig;
