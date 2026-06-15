'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Session sync for the share tab. The better-auth cookie change after
// a sign-in elsewhere doesn't trigger a re-render on already-open
// tabs, so this component polls verify-session whenever the share tab
// becomes visible again and calls router.refresh() if the server's
// view of the user no longer matches what we rendered with.
//
// The viewer lives under /r on the SAME origin as
// better-auth, so this hits the same-origin /api/verify-session
// directly (no cross-origin CORS request).
//
// Cheap: one GET per focus / visibilitychange (debounced 2s), only
// fires when the tab is foregrounded.

const VERIFY_URL = '/api/verify-session';

type Props = {
  // userId from the most recent server render. null = rendered for
  // anonymous viewer. The hook re-renders the page whenever the
  // verify-session result disagrees with this value.
  initialUserId: string | null;
};

export function AuthSync({ initialUserId }: Props) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let lastCheck = 0;

    const check = async () => {
      // Debounce: visibilitychange + focus often fire back-to-back.
      const now = Date.now();
      if (now - lastCheck < 2000) return;
      lastCheck = now;

      try {
        const res = await fetch(VERIFY_URL, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });
        if (cancelled) return;

        let currentUserId: string | null = null;
        if (res.ok) {
          const json = (await res.json()) as { userId?: unknown };
          if (typeof json.userId === 'string') currentUserId = json.userId;
        }
        if (currentUserId !== initialUserId) {
          router.refresh();
        }
      } catch {
        // Network blip — leave the page alone; the next focus
        // will retry. We don't refresh on failure because that'd
        // cycle a stale page through itself.
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void check();
    };

    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [initialUserId, router]);

  return null;
}
