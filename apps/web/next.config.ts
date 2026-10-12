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
  turbopack: {
    rules: { "*.md": { loaders: ["raw-loader"], as: "*.js" } },
  },
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
  /*
   * Transport and sniffing protections only. No CSP here on purpose: this app
   * pulls media from the CDN, proxies PostHog through /ingest, and takes camera,
   * microphone and display-capture for the recorder — a policy tight enough to
   * be worth having is tight enough to break one of those, and it needs to be
   * derived from a real inventory rather than guessed at. The admin panel, which
   * has no third-party anything, does carry one.
   */
  async headers() {
    const transport = [
      {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ];
    return [
      {
        source: "/((?!embed/).*)",
        headers: [
          ...transport,
          // Same-origin keeps the app's own framing working; only /embed is framable.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      {
        /*
         * The extension frames the player on GitHub from one of its own pages,
         * and frame-ancestors checks every ancestor, so both the extension and
         * GitHub have to be allowed.
         */
        source: "/embed/:path*",
        headers: [
          ...transport,
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' chrome-extension: https://github.com",
          },
        ],
      },
    ];
  },
  // The roadmap page is gone; old links and search results land on the homepage.
  async redirects() {
    return [{ source: "/roadmap", destination: "/", permanent: true }];
  },
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
