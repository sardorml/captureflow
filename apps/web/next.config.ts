import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const nextConfig: NextConfig = {
  // The vendored workspace packages ship TS source from the monorepo, so
  // Next has to transpile them or their .ts files fail to resolve.
  transpilePackages: ['@captureflow/shared', '@captureflow/quota', '@captureflow/ui'],
  images: {
    // Snap/share viewers render <Image> with non-default quality values;
    // Next 16 requires every used value to be allow-listed.
    qualities: [75, 100],
  },
  experimental: {
    // saveSnapAction POSTs a baked PNG that on retina screens runs 3–5 MB.
    // The per-snap cap in actions.ts (8 MB) backstops the rest.
    serverActions: { bodySizeLimit: '8mb' },
  },
  // PostHog ingestion is proxied through /ingest so tracker-blockers don't
  // drop first-party analytics (see app/analytics-provider.tsx).
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      { source: '/ingest/:path*', destination: 'https://us.i.posthog.com/:path*' },
    ];
  },
};

// Makes Cloudflare bindings (D1, R2) available during `next dev` via
// getCloudflareContext().
initOpenNextCloudflareForDev();

export default nextConfig;
