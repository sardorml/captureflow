import { loadPosthog, posthogIfLoaded } from "@/lib/posthog-client";

export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  void loadPosthog().then((posthog) => posthog?.capture(event, props));
}

// Passed to Lemon Squeezy as checkout[custom][ph_distinct_id] to stitch a
// checkout back to the web session. Read synchronously at click time, so it
// is null only if the library has not finished loading in the background.
export function getPosthogDistinctId(): string | null {
  try {
    return posthogIfLoaded()?.get_distinct_id() || null;
  } catch {
    return null;
  }
}
