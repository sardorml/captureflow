'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { POSTHOG_KEY } from '@/lib/public-analytics';

// Keyed on email because the desktop client also keys on email, stitching the
// funnel across both surfaces.
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
