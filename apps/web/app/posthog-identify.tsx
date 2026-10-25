"use client";

import { useEffect } from "react";
import { loadPosthog } from "@/lib/posthog-client";
import { whenIdle } from "@/lib/when-idle";

// Keyed on email because the desktop client also keys on email, stitching the
// funnel across both surfaces.
export function PostHogIdentify({
  email,
}: {
  email: string | null | undefined;
}): null {
  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    const cancelIdle = whenIdle(() => {
      void loadPosthog().then((posthog) => {
        if (!cancelled) posthog?.identify(email, { email });
      });
    });
    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, [email]);

  return null;
}
