'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { POSTHOG_KEY } from '@/lib/public-analytics';

// Attaches the signed-in user's identity to PostHog so web events join the
// same person as their desktop activity. Identified by EMAIL — the desktop
// client also keys on email so the landing → download → install → upgrade
// funnel stitches across surfaces.
// Rendered from the dashboard layout, where the better-auth session is known.
export function PostHogIdentify({
  email,
}: {
  email: string | null | undefined;
}): null {
  useEffect(() => {
    if (!POSTHOG_KEY || !email) return;
    posthog.identify(email, { email });
  }, [email]);

  return null;
}
