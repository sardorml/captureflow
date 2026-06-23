'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import posthog from 'posthog-js';
import { POSTHOG_KEY } from '@/lib/public-analytics';

/*
 * next.config rewrites /ingest/* → PostHog US cloud so requests look
 * first-party and slip past ad blockers / Brave Shields that block
 * us.i.posthog.com directly. ui_host keeps app links on the real dashboard.
 */
const POSTHOG_PROXY_HOST = '/ingest';
const POSTHOG_UI_HOST = 'https://us.posthog.com';

// No consent banner by current product decision; cookie persistence stitches
// visitors across sessions — revisit if EU consent becomes a requirement.

let initialized = false;

function ensureInit(): boolean {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return false;
  if (!initialized) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_PROXY_HOST,
      ui_host: POSTHOG_UI_HOST,
      // Sent manually below; Next client-side routing doesn't trigger
      // PostHog's own pageview capture.
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
      disable_session_recording: true,
      persistence: 'localStorage+cookie',
    });
    initialized = true;
  }
  return true;
}

export function AnalyticsProvider(): null {
  const pathname = usePathname();

  useEffect(() => {
    if (!ensureInit()) return;
    posthog.capture('$pageview', { $current_url: window.location.href });
  }, [pathname]);

  return null;
}
