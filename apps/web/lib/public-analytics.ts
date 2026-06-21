// Public, client-side analytics config.
//
// These tokens are NOT secret and are meant to be embedded in the page:
//   - The PostHog project key is a write-only ingest key (phc_…).
//   - The Cloudflare Web Analytics beacon token is exposed in page HTML by
//     design.
// So they're hardcoded here (this codebase reads NEXT_PUBLIC_* server-side via
// the CF binding, not inlined into client bundles — see lib/cf-env.ts — so a
// client-side public value lives in source, matching the existing CF beacon).
//
// Both integrations stay DORMANT while their value is empty: no PostHog init,
// no beacon. Fill these in after creating the project/site.

// PostHog product analytics (web). Use the SAME project key as the desktop app
// (its POSTHOG_KEY) so the cross-surface funnel — landing →
// download → install → first recording → upgrade — stitches into one journey.
export const POSTHOG_KEY = 'phc_rX8yKmqsTKMUQ5dUkyW2aCv3vV8pAfQztbKgXag8cY73';
export const POSTHOG_HOST = 'https://us.i.posthog.com';

// Cloudflare Web Analytics. captureflow.xyz is proxied through Cloudflare, so
// CF auto-injects its own beacon at the edge (the "Automatic setup" site) — that
// site already collects pageviews with no code. We therefore leave this EMPTY so
// our manual <Script> beacon (app/layout.tsx) doesn't render and double-count
// against a second site. Only set a token if you turn OFF automatic setup and
// want the explicit JS-snippet install instead.
export const CF_BEACON_TOKEN = '';
