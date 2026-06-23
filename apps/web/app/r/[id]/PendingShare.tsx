'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentByline } from '../../_components/snap';
import { GridLoader } from '@captureflow/ui';

type PendingShareProps = {
  slug: string;
  titleLine: string;
  createdAt: number;
};

const POLL_INTERVAL_MS = 1500;
// ~2 min cap. A pending row stuck past this means the desktop client
// died mid-upload; the cron sweep GCs it within the hour.
const MAX_ATTEMPTS = 80;

export function PendingShare({
  slug,
  titleLine,
  createdAt,
}: PendingShareProps) {
  const router = useRouter();
  const [exhausted, setExhausted] = useState(false);
  const [failed, setFailed] = useState(false);
  const attemptsRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const tick = async (): Promise<void> => {
      if (cancelled) return;
      attemptsRef.current += 1;
      try {
        const res = await fetch(
          `/api/r/state?slug=${encodeURIComponent(slug)}`,
          {
            cache: 'no-store',
          }
        );
        if (cancelled) return;
        if (res.ok) {
          const body = (await res.json()) as {
            state: 'pending' | 'ready' | 'failed' | 'missing';
          };
          if (body.state === 'ready') {
            router.refresh();
            return;
          }
          if (body.state === 'failed' || body.state === 'missing') {
            setFailed(true);
            return;
          }
        }
      } catch {
        // Fall through to the retry.
      }
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        setExhausted(true);
        return;
      }
      setTimeout(tick, POLL_INTERVAL_MS);
    };
    const t = setTimeout(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [slug, router]);

  const showRetry = exhausted || failed;

  return (
    <main className="flex flex-col items-center bg-neutral-950 px-4 py-6 text-neutral-100">
      <div className="flex w-full max-w-4xl flex-col">
        <header className="mb-4">
          <h1 className="truncate text-[22px] font-[600] tracking-tight text-neutral-100 sm:text-2xl">
            {titleLine}
          </h1>
          <ContentByline ownerName={null} createdAt={createdAt} />
        </header>
        <div
          // Match SharePlayer's container so swapping in the video doesn't reflow.
          className="relative w-full overflow-hidden rounded-xl bg-neutral-900 ring-1 ring-line"
          style={{ aspectRatio: '16 / 9' }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
            {showRetry ? (
              <>
                <p className="text-base font-medium text-neutral-200">
                  This share didn&apos;t finish uploading.
                </p>
                <p className="max-w-sm text-sm text-neutral-400">
                  The link was created but the video never arrived. Try the link
                  again in a minute, or record a fresh share from the CaptureFlow
                  desktop app.
                </p>
              </>
            ) : (
              <>
                <GridLoader size={9} className="text-blue-300" />
                <p className="text-sm font-medium text-neutral-200">
                  Preparing your share…
                </p>
                <p className="max-w-xs text-xs text-neutral-500">
                  The recording is still uploading. This page refreshes the
                  moment it&apos;s ready.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
