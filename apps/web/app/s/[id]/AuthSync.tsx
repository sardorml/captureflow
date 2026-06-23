'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// A sign-in/out in another tab writes the session cookie this tab will
// see, but the cookie change doesn't re-render an already-open tab.
// Re-check verify-session on focus/visibilitychange and refresh the
// route when the user differs from what we last rendered.
const VERIFY_URL = '/api/verify-session';

type Props = {
  initialUserId: string | null;
};

export function AuthSync({ initialUserId }: Props) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let lastCheck = 0;

    const check = async () => {
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
        // Ignore network failures; the next focus retries.
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
