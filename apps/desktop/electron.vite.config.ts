import { readFileSync } from 'fs'
import { resolve } from 'path'
import { defineConfig, loadEnv } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))

// Build-time env injection. The main process can't read `process.env` at
// runtime inside a packaged `.app`, so we inline values from `.env` /
// `.env.local` / `.env.production` into the bundle via Vite's `define`.
// Currently only the Lemon Squeezy product ID is baked in; the license
// endpoints themselves authenticate via the customer's license key and
// don't need an API token.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // `__IS_BETA__` gates the beta-only UI (e.g. the "BETA" badge in the editor
  // title bar). Tied to the `-beta` suffix on package.json#version so bumping
  // to a non-beta release (1.0.0) drops the flag automatically.
  const isBeta = /-beta(\.|$)/.test(pkg.version)
  const define = {
    // Studio license activation (LS license keys) was removed when the app
    // went free-only, so no product-id defines are needed. The checkout URL
    // below is still used by Share mode's storage-quota "Upgrade to Pro".
    //
    // Dev builds open the test-mode checkout (Lemon Squeezy issues test keys
    // there); packaged builds open the live one. Selecting at build time keeps
    // the test URL out of production bundles entirely.
    'process.env.LEMON_SQUEEZY_CHECKOUT_URL': JSON.stringify(
      mode === 'development'
        ? (env.LEMON_SQUEEZY_TEST_CHECKOUT_URL ??
            process.env['LEMON_SQUEEZY_TEST_CHECKOUT_URL'] ??
            '')
        : (env.LEMON_SQUEEZY_CHECKOUT_URL ?? process.env['LEMON_SQUEEZY_CHECKOUT_URL'] ?? '')
    ),
    'process.env.FORMIK_KEY': JSON.stringify(env.FORMIK_KEY ?? process.env['FORMIK_KEY'] ?? ''),
    __IS_BETA__: JSON.stringify(isBeta),
    // App version, baked from package.json so the renderer can tag analytics
    // events without an IPC round-trip.
    __APP_VERSION__: JSON.stringify(pkg.version),
    // PostHog usage-analytics (opt-in). The project key is a write-only
    // ingest key, safe to embed in the client bundle. Left empty when not
    // configured, which keeps the analytics client fully dormant (no init,
    // no network) — drop POSTHOG_KEY into .env.local / .env.production to
    // enable it. Host defaults to PostHog US Cloud.
    __POSTHOG_KEY__: JSON.stringify(env.POSTHOG_KEY ?? process.env['POSTHOG_KEY'] ?? ''),
    __POSTHOG_HOST__: JSON.stringify(
      env.POSTHOG_HOST ?? process.env['POSTHOG_HOST'] ?? 'https://us.i.posthog.com'
    )
  }

  // Web-service base URLs. The main process reads these as `process.env.CAPTUREFLOW_*`
  // (share-api-client, snap-upload, share-usage, share-edit-url,
  // share-auth-handlers, index.ts). Each consumer does
  // `process.env.CAPTUREFLOW_X ?? 'https://captureflow.xyz/...'`.
  //
  //  - development (pnpm app): default at the LOCAL merged web app
  //    (localhost:3032, with /r and /s path prefixes) so the desktop app talks
  //    to LOCAL data — shares open localhost, the toolbar reflects local
  //    account/usage, the login overlay points at local auth. A `.env.local`
  //    entry still overrides (point dev at prod or a preview host).
  //  - production: only inline when the value is explicitly set in the env.
  //    Otherwise we DON'T define the key — the packaged `.app` reads
  //    `process.env.CAPTUREFLOW_X` as `undefined` at runtime, so each consumer's
  //    own hardcoded prod fallback applies. We must NOT inline `''` here:
  //    `'' ?? fallback` keeps the empty string and breaks the fallback.
  const webBaseDevDefaults = {
    CAPTUREFLOW_SHARE_API_BASE: 'http://localhost:3032/api/r',
    CAPTUREFLOW_SNAP_API_BASE: 'http://localhost:3032/api/s',
    CAPTUREFLOW_APP_WEB_BASE: 'http://localhost:3032',
    CAPTUREFLOW_APP_WEB_API_BASE: 'http://localhost:3032'
  }
  for (const key of Object.keys(webBaseDevDefaults)) {
    const value = env[key] ?? (mode === 'development' ? webBaseDevDefaults[key] : undefined)
    if (value !== undefined) {
      define[`process.env.${key}`] = JSON.stringify(value)
    }
  }
  return {
    main: { define },
    preload: { define },
    renderer: {
      define,
      resolve: {
        alias: {
          '@renderer': resolve('src/renderer/src'),
          '@': resolve('src/renderer/src')
        }
      },
      plugins: [react(), tailwindcss()]
    }
  }
})
