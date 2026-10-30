"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { initials } from "@/lib/format";
import { ContentByline } from "../../_components/screenshot";
import { PoweredBy } from "../../_components/powered-by";
import { sizeStyleForAspect } from "../../_components/recording/layout";
import { DEFAULT_REACTIONS } from "@/lib/recording/reactions";
import { ViewCount } from "./ViewCount";

type PendingRecordingProps = {
  slug: string;
  titleLine: string;
  ownerName: string | null;
  createdAt: number;
  viewCount: number;
  isOwner: boolean;
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
  ownerName,
  createdAt,
  viewCount,
  isOwner,
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

  // Mirrors RecordingViewer, RecordingPlayer and ActivitySidebar so nothing
  // moves when the ready page swaps in.
  return (
    <div className="grid w-full grid-cols-1 bg-panel lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-1 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <main className="flex flex-col bg-stage lg:min-h-0 lg:overflow-y-auto">
        <header className="sticky top-0 z-20 bg-panel max-lg:static max-lg:order-2">
          <div className="px-6 py-5 sm:px-8">
            <div className="flex w-full gap-5 max-lg:flex-col max-lg:gap-3 lg:items-start">
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-[600] tracking-tight text-neutral-100 lg:truncate lg:text-2xl">
                  {titleLine}
                </h1>
                <ContentByline
                  ownerName={ownerName}
                  createdAt={createdAt}
                  leading={
                    ownerName ? (
                      <Avatar className="size-9 lg:hidden">
                        <AvatarFallback className="text-sm">
                          {initials(ownerName)}
                        </AvatarFallback>
                      </Avatar>
                    ) : null
                  }
                />
              </div>
              <ViewCount
                count={viewCount}
                viewers={null}
                className="max-lg:self-start"
              />
            </div>
          </div>
        </header>
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center py-6 max-lg:contents">
          <div
            className="relative overflow-clip rounded-[var(--media-border-radius,16px)] max-lg:order-1 max-lg:w-full! max-lg:rounded-none"
            style={sizeStyleForAspect(16 / 10, "calc(100vh - 19rem)")}
          >
            <Skeleton className="absolute inset-0 rounded-[inherit]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              {showRetry ? (
                <>
                  <p className="text-base font-semibold text-fg">
                    This recording didn&apos;t finish uploading
                  </p>
                  <p className="max-w-sm text-sm text-fg-muted">
                    The link was created but the video never arrived. Try the
                    link again in a minute, or record a fresh one.
                  </p>
                </>
              ) : (
                <>
                  <Spinner className="size-6" />
                  <p className="mt-1 text-base font-semibold text-fg">
                    Preparing your recording…
                  </p>
                  <p className="max-w-xs text-sm text-fg-muted">
                    The upload is still finishing. This page refreshes on its
                    own once it&apos;s ready.
                  </p>
                </>
              )}
            </div>
          </div>
          <div
            aria-hidden="true"
            className="mt-8 flex items-center justify-center gap-2 opacity-50 max-lg:order-3 max-lg:mt-5 max-lg:px-4"
          >
            <div className="flex items-center gap-1 rounded-full bg-panel px-2 py-1.5 shadow-md">
              {DEFAULT_REACTIONS.map((r) => (
                <span
                  key={r.emoji}
                  className="flex h-12 w-12 items-center justify-center rounded-full text-[28px] leading-none max-sm:h-10 max-sm:w-10 max-sm:text-[22px]"
                >
                  {r.emoji}
                </span>
              ))}
            </div>
            <span className="flex h-[60px] items-center gap-2.5 rounded-full bg-panel px-6 text-base font-medium text-fg shadow-md max-sm:h-[52px] max-sm:px-4">
              <MessageSquare className="h-6 w-6" />
              <span className="hidden sm:inline">Comment</span>
            </span>
          </div>
          <footer className="mt-8 flex w-full justify-center border-t border-line pt-6 max-lg:order-4 max-lg:mb-6">
            <PoweredBy />
          </footer>
        </div>
      </main>
      <aside className="flex w-full flex-col border-black/[0.06] bg-panel max-lg:border-t lg:h-full lg:w-auto lg:overflow-hidden lg:border-l dark:border-white/[0.07]">
        <header className="flex items-center px-5 py-4 lg:px-6 lg:pt-5">
          <div className="flex w-full rounded-xl bg-tint p-1">
            <span className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-panel px-3.5 text-sm font-medium text-fg shadow-sm dark:bg-white/10">
              Activity
              <span className="rounded-full bg-tint-strong px-2 py-0.5 text-xs font-medium tabular-nums">
                0
              </span>
            </span>
            <span className="flex h-8 flex-1 items-center justify-center px-3.5 text-sm font-medium text-fg-muted">
              Transcript
            </span>
            {isOwner ? (
              <span className="flex h-8 flex-1 items-center justify-center px-3.5 text-sm font-medium text-fg-muted">
                Edit
              </span>
            ) : null}
          </div>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tint text-fg-muted ring-1 ring-line-strong">
            <MessageSquare className="h-5 w-5" />
          </div>
          <p className="mt-4 text-base font-semibold text-fg">
            No activity yet
          </p>
          <p className="mt-1.5 max-w-[18rem] text-xs leading-relaxed text-fg-muted">
            Reactions and comments from viewers will show up here once the
            recording is ready.
          </p>
        </div>
      </aside>
    </div>
  );
}
