// OpenNext configuration for Cloudflare Workers + Workers Assets.
// Defaults match the admin app — low-volume signed-in dashboard,
// no ISR or background tasks.

import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig({});
