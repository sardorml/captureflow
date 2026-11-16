"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  loadContestTracker,
  shouldLoadContestTracker,
} from "@/lib/contest-tracker";
import { loadPosthog } from "@/lib/posthog-client";
import { whenIdle } from "@/lib/when-idle";

export function AnalyticsProvider(): null {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    const cancelIdle = whenIdle(() => {
      void loadPosthog().then((posthog) => {
        if (cancelled) return;
        posthog?.capture("$pageview", { $current_url: window.location.href });
      });
    });
    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, [pathname]);

  useEffect(() => {
    if (shouldLoadContestTracker(window.location.hostname, pathname)) {
      loadContestTracker();
    }
  }, [pathname]);

  return null;
}
