import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const nextConfig: NextConfig = {
  transpilePackages: ['@captureflow/shared', '@captureflow/quota', '@captureflow/ui'],
  images: {
    // Next 16 requires every used <Image> quality value to be allow-listed.
    qualities: [75, 100],
  },
  experimental: {
    serverActions: { bodySizeLimit: '8mb' },
  },
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

initOpenNextCloudflareForDev();

export default nextConfig;
