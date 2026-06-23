/*
 * These tokens are NOT secret and are embedded in the page by design (the
 * PostHog key is a write-only ingest key). Each integration stays dormant while
 * its value is empty.
 */

// Same project key as the desktop app, so the cross-surface funnel stitches into
// one journey.
export const POSTHOG_KEY = "phc_rX8yKmqsTKMUQ5dUkyW2aCv3vV8pAfQztbKgXag8cY73";
export const POSTHOG_HOST = "https://us.i.posthog.com";

// Leave empty: Cloudflare auto-injects its own beacon at the edge, so a manual
// beacon here would double-count pageviews.
export const CF_BEACON_TOKEN = "";
