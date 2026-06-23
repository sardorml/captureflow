import posthog from "posthog-js";
import { POSTHOG_KEY } from "@/lib/public-analytics";

export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined" || !POSTHOG_KEY) return;
  posthog.capture(event, props);
}

// Passed to Lemon Squeezy as checkout[custom][ph_distinct_id] to stitch a
// checkout back to the web session.
export function getPosthogDistinctId(): string | null {
  if (typeof window === "undefined" || !POSTHOG_KEY) return null;
  try {
    return posthog.get_distinct_id() || null;
  } catch {
    return null;
  }
}
