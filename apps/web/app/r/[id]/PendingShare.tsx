'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentByline } from '../../_components/snap';
import { GridLoader } from '@captureflow/ui';

type PendingShareProps = {
  slug: string;
  titleLine: string;
  // Epoch ms — surfaced as a "just now" / "X minutes ago" byline so
  // the loading shell matches the resolved share page. Owner name is
  // omitted in the pending state to avoid a second DB hop; it lands
  // on the next refresh once the row flips to 'ready'.
  createdAt: number;
};

// Loading shell shown when /r/[id] resolves a row in state='pending'.
// /api/r/init reserves the id at record-start so the desktop can hand
// the user a copyable link instantly; the bytes themselves arrive over
// the streaming-multipart upload during recording and the row flips to
// 'ready' once /api/r/finalize lands. The loader holds the page steady
// while that's still in flight.
//
// Polls /api/r/state every ~1.5s and router.refresh()-es once the row
// flips to 'ready'. The same retry budget surfaces a "didn't finish"
// fallback when the upload never completes (desktop died mid-record).

const POLL_INTERVAL_MS = 1500;
// Cap the spin at roughly 2 minutes. /api/r/init → /api/r/finalize is
// usually <10s; the multipart upload limit is far longer but a stuck
// pending row past 2 minutes almost always means the desktop client
// died mid-upload and the cron sweep will GC it within the hour.
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
        // Transient network error — fall through to the retry.
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
          // Match the SharePlayer's container so the loading shell
          // doesn't reflow the page when the bytes arrive.
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
