"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ContentByline } from "../../_components/screenshot";
import { Spinner } from "@heroui/react";

type PendingRecordingProps = {
  slug: string;
  titleLine: string;
  createdAt: number;
  viewCount: number;
};

const POLL_INTERVAL_MS = 1500;
/*
 * ~10 min cap: the extension lands viewers here right at stop, so a long tail
 * upload on a slow uplink is still in flight well past two minutes. A pending
 * row stuck past this means the client died mid-upload; the cron sweep GCs it
 * within the hour.
 */
const MAX_ATTEMPTS = 400;

export function PendingRecording({
  slug,
  titleLine,
  createdAt,
  viewCount,
}: PendingRecordingProps) {
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
            cache: "no-store",
          },
        );
        if (cancelled) return;
        if (res.ok) {
          const body = (await res.json()) as {
            state: "pending" | "ready" | "failed" | "missing";
          };
          if (body.state === "ready") {
            router.refresh();
            return;
          }
          if (body.state === "failed" || body.state === "missing") {
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

  // Mirrors RecordingViewer's skeleton — grid, sticky header, player column,
  // sidebar shell — so nothing moves when the ready page swaps in.
  return (
    <div className="grid w-full grid-cols-1 bg-canvas lg:h-[calc(100vh-64px)] lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-1 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <main className="flex flex-col lg:min-h-0 lg:overflow-y-auto">
        <header className="sticky top-0 z-20 border-b border-line bg-canvas-2">
          <div className="relative px-6 py-5 lg:px-12">
            <div className="mx-auto w-full max-w-5xl pr-32 sm:pr-36">
              <h1 className="truncate text-[22px] font-[600] tracking-tight text-neutral-100 sm:text-2xl">
                {titleLine}
              </h1>
              <ContentByline ownerName={null} createdAt={createdAt} />
            </div>
            <span className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-tint px-3 py-1 text-xs font-medium text-neutral-300 ring-1 ring-line lg:right-12">
              {viewCount.toLocaleString()} {viewCount === 1 ? "view" : "views"}
            </span>
          </div>
        </header>
        <div className="mx-auto flex w-full max-w-5xl flex-col px-6 py-6 lg:px-12">
          <div
            // Match RecordingPlayer's container so swapping in the video doesn't reflow.
            className="relative w-full overflow-hidden rounded-xl bg-neutral-900 ring-1 ring-line"
            style={{ aspectRatio: "16 / 9" }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
              {showRetry ? (
                <>
                  <p className="text-base font-medium text-neutral-200">
                    This recording didn&apos;t finish uploading.
                  </p>
                  <p className="max-w-sm text-sm text-neutral-400">
                    The link was created but the video never arrived. Try the
                    link again in a minute, or record a fresh one.
                  </p>
                </>
              ) : (
                <>
                  <Spinner size="lg" />
                  <p className="text-sm font-medium text-neutral-200">
                    Preparing your recording…
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
      <aside className="hidden w-full flex-col bg-canvas-2 lg:flex lg:h-full lg:border-l lg:border-line" />
    </div>
  );
}
