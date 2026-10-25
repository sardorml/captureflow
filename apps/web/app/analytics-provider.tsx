"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { loadPosthog, whenIdle } from "@/lib/posthog-client";

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

  return null;
}
