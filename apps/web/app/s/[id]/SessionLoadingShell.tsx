"use client";

import { useEffect } from "react";
import { Spin } from "antd";

/*
 * Rendered when the SSR call to verify-session fails transiently
 * (cold-start, network blip, 5xx) on a gated snap. Distinct from
 * RequestAccess: SSR doesn't yet know whether the visitor is an
 * authorized owner/member, so we show a neutral "loading snap" frame
 * and immediately probe from the browser. Once verify-session resolves
 * either way we location.replace() back into the same URL and let SSR
 * re-run with the cookies in hand. After the retry budget exhausts we
 * re-run SSR anyway so a genuinely-broken backend doesn't trap the
 * visitor on a spinner.
 */

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
            method: "GET",
            credentials: "include",
            cache: "no-store",
          });
          if (cancelled) return;
          // Either way we re-enter SSR: a 200 means owner/member and
          // the gate will render the viewer; a 401 means RequestAccess
          // — and that's the correct screen, not this spinner.
          if (res.status === 200 || res.status === 401) {
            window.location.replace(window.location.href);
            return;
          }
        } catch {
          // Same backend is failing the SSR retry; keep trying.
        }
      }
      // Budget exhausted. Re-run SSR so the visitor lands on
      // RequestAccess (or the viewer) instead of staring at a spinner.
      if (!cancelled) window.location.replace(window.location.href);
    })();

    return () => {
      cancelled = true;
    };
  }, [appWebUrl]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-16 text-neutral-300">
      <div className="flex flex-col items-center gap-4">
        <Spin size="large" />
        <p className="text-sm text-neutral-500">Loading snap…</p>
      </div>
    </div>
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
