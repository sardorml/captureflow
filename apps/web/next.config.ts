import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@captureflow/shared",
    "@captureflow/quota",
    "@captureflow/ui",
  ],
  images: {
    // Next 16 requires every used <Image> quality value to be allow-listed.
    qualities: [75, 100],
  },
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
    /*
     * Turbopack's dev filesystem cache (`.next/dev/cache`, default on, grew to
     * 5.2 GB here) is reloaded on boot, so restarting the dev server does not
     * recompile. A chunk that went stale — a Tailwind class missing because the
     * scanner ran before the file was written — then survived every restart and
     * only came back when the source file changed again. Off, so starting the
     * server means what it says.
     */
    turbopackFileSystemCacheForDev: false,
  },
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
};

// Dev only, for the reason spelled out in apps/admin/next.config.ts.
if (process.env.NODE_ENV !== "production") {
  initOpenNextCloudflareForDev();
}

export default nextConfig;
