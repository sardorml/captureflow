'use client';

import { useEffect } from 'react';
import { GridLoader } from '@captureflow/ui';

type Props = {
  appWebUrl: string;
};

const PROBE_DELAYS_MS = [0, 400, 1200, 2500, 5000] as const;

export function SessionLoadingShell({ appWebUrl }: Props) {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      for (const delay of PROBE_DELAYS_MS) {
        if (cancelled) return;
        if (delay > 0) await sleep(delay);
        try {
          const res = await fetch(`${appWebUrl}/api/verify-session`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          });
          if (cancelled) return;
          if (res.status === 200 || res.status === 401) {
            window.location.replace(window.location.href);
            return;
          }
        } catch {
          // keep trying
        }
      }
      if (!cancelled) window.location.replace(window.location.href);
    })();

    return () => {
      cancelled = true;
    };
  }, [appWebUrl]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-16 text-neutral-300">
      <div className="flex flex-col items-center gap-4">
        <GridLoader />
        <p className="text-sm text-neutral-500">Loading recording…</p>
      </div>
    </div>
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
