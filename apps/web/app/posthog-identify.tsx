"use client";

import { useEffect } from "react";
import { loadPosthog } from "@/lib/posthog-client";
import { whenIdle } from "@/lib/when-idle";

// Keyed on email because the desktop client also keys on email, stitching the
// funnel across both surfaces.
export function PostHogIdentify({
  email,
  name,
  userId,
}: {
  email: string | null | undefined;
  name: string | null | undefined;
  userId: string;
}): null {
  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    const cancelIdle = whenIdle(() => {
      void loadPosthog().then((posthog) => {
        if (cancelled) return;
        posthog?.identify(email, {
          email,
          name: name ?? undefined,
          user_id: userId,
        });
      });
    });
    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, [email, name, userId]);

  return null;
}
