'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import posthog from 'posthog-js';
import { POSTHOG_KEY } from '@/lib/public-analytics';

// First-party ingestion path. next.config rewrites /ingest/* → PostHog US
// cloud, so requests look first-party and slip past ad blockers / Brave
// Shields that block us.i.posthog.com directly (which was silently dropping
// every pageview). ui_host keeps PostHog toolbar/app links pointing at the
// real dashboard.
const POSTHOG_PROXY_HOST = '/ingest';
const POSTHOG_UI_HOST = 'https://us.posthog.com';

// Web product analytics via PostHog. Mounted once in the root layout; renders
// nothing. Dormant unless POSTHOG_KEY is set.
//
// Unlike the desktop client (which disables autocapture and only sends a few
// explicit events), the web side turns autocapture ON so marketing/conversion
// funnels come for free. Session recording stays OFF. Per the current product
// decision there is no consent banner — persistence uses cookies so visitors
// are stitched across sessions; revisit if EU consent becomes a requirement.

let initialized = false;

function ensureInit(): boolean {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return false;
  if (!initialized) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_PROXY_HOST,
      ui_host: POSTHOG_UI_HOST,
      // We send $pageview manually on App Router navigations below — Next's
      // client-side routing doesn't trigger PostHog's own pageview capture.
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
    // window.location.href carries the full URL incl. query at capture time.
    posthog.capture('$pageview', { $current_url: window.location.href });
  }, [pathname]);

  return null;
}
