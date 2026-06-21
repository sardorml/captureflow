// Tiny client-safe wrapper around PostHog for marketing conversion events.
//
// PostHog itself is initialized once by <AnalyticsProvider> in the root
// layout; capturing on the imported singleton here is safe. Both helpers
// no-op (and never throw) when analytics is dormant — POSTHOG_KEY empty —
// or when running outside the browser, so call sites need no guards.

import posthog from 'posthog-js';
import { POSTHOG_KEY } from '@/lib/public-analytics';

export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return;
  posthog.capture(event, props);
}

// The visitor's PostHog distinct_id, used to stitch a Lemon Squeezy checkout
// back to the web session (passed as checkout[custom][ph_distinct_id]).
// Returns null when analytics is dormant, uninitialized, or unavailable.
export function getPosthogDistinctId(): string | null {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return null;
  try {
    return posthog.get_distinct_id() || null;
  } catch {
    return null;
  }
}
