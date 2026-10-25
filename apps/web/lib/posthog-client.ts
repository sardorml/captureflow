import type { PostHog } from "posthog-js";
import { POSTHOG_KEY } from "@/lib/public-analytics";

/*
 * next.config rewrites /ingest/* → PostHog US cloud so requests look
 * first-party and slip past ad blockers / Brave Shields that block
 * us.i.posthog.com directly. ui_host keeps app links on the real dashboard.
 *
 * No consent banner by current product decision; cookie persistence stitches
 * visitors across sessions — revisit if EU consent becomes a requirement.
 */
const POSTHOG_PROXY_HOST = "/ingest";
const POSTHOG_UI_HOST = "https://us.posthog.com";

let loading: Promise<PostHog | null> | null = null;
let loaded: PostHog | null = null;

// The library is a dynamic import so it never rides the page's own bundle;
// the first caller initialises it, everyone else shares the instance.
export function loadPosthog(): Promise<PostHog | null> {
  if (typeof window === "undefined" || !POSTHOG_KEY) {
    return Promise.resolve(null);
  }
  loading ??= import("posthog-js").then(({ default: posthog }) => {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_PROXY_HOST,
      ui_host: POSTHOG_UI_HOST,
      // Sent manually; Next client-side routing doesn't trigger PostHog's own
      // pageview capture.
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
      disable_session_recording: true,
      persistence: "localStorage+cookie",
    });
    loaded = posthog;
    return posthog;
  });
  return loading;
}

export function posthogIfLoaded(): PostHog | null {
  return loaded;
}
