// Public, client-side analytics config. These tokens are NOT secret and are
// meant to be embedded in the page: the PostHog key is a write-only ingest key,
// and the Cloudflare beacon token is exposed in page HTML by design. They're
// hardcoded because this codebase reads NEXT_PUBLIC_* server-side via the CF
// binding (lib/cf-env.ts) rather than inlining them into client bundles.
//
// Each integration stays dormant while its value is empty: no PostHog init, no
// beacon.

// Use the SAME project key as the desktop app so the cross-surface funnel —
// landing → download → install → first recording → upgrade — stitches into one
// journey.
export const POSTHOG_KEY = 'phc_rX8yKmqsTKMUQ5dUkyW2aCv3vV8pAfQztbKgXag8cY73';
export const POSTHOG_HOST = 'https://us.i.posthog.com';

// captureflow.xyz is proxied through Cloudflare, which auto-injects its own
// beacon at the edge ("Automatic setup"), already collecting pageviews with no
// code. Leave this empty so our manual <Script> beacon (app/layout.tsx) doesn't
// render and double-count against a second site. Only set a token if you turn
// off automatic setup and want the explicit JS-snippet install instead.
export const CF_BEACON_TOKEN = '';
