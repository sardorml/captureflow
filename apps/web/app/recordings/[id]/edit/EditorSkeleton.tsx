"use client";

import { useAppMessages } from "@/components/app-i18n-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { PosterLayer } from "@/app/_components/recording/PosterLayer";

// Stands in for the editor while its chunk loads: the same bar, stage, panel,
// timeline and rail, with the poster already on the stage, so the page settles
// into place instead of swapping a spinner for the whole layout. No blur
// behind the poster: the stage is wider than the video, and the blur would
// smear past the frame's edges.
export function EditorSkeleton({ posterUrl }: { posterUrl?: string }) {
  const m = useAppMessages();
  return (
    <div
      role="status"
      aria-label={m.recordingEditor.skeleton.label}
      className="flex h-screen flex-col overflow-hidden bg-canvas"
    >
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-panel px-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <Skeleton className="ml-3 h-6 w-full max-w-3xl rounded-md" />
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Skeleton className="mr-2 h-4 w-40 rounded-md max-md:hidden" />
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="ml-1 h-10 w-20 rounded-full" />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1">
            <section className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-neutral-950">
              {posterUrl ? <PosterLayer posterUrl={posterUrl} /> : null}
              <div className="absolute inset-x-0 bottom-0 flex h-14 items-center gap-3 bg-black/60 px-4">
                <Skeleton className="size-6 rounded-full bg-white/20" />
                <Skeleton className="size-6 rounded-full bg-white/20" />
                <Skeleton className="size-6 rounded-full bg-white/20" />
                <Skeleton className="mx-auto h-4 w-24 rounded-md bg-white/20" />
                <Skeleton className="size-6 rounded-full bg-white/20" />
                <Skeleton className="size-6 rounded-full bg-white/20" />
              </div>
            </section>

            <aside className="hidden w-[max(20rem,29vw)] shrink-0 flex-col gap-5 border-l border-line bg-panel p-4 lg:flex">
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-11/12 rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <Skeleton className="h-5 w-full rounded-md" />
                <Skeleton className="h-5 w-10/12 rounded-md" />
                <Skeleton className="h-5 w-9/12 rounded-md" />
              </div>
            </aside>
          </div>

          <div className="flex h-40 shrink-0 flex-col border-t border-line bg-panel">
            <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-line px-3">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>
              <Skeleton className="h-4 w-40 rounded-md" />
            </div>
            <div className="px-3 pt-3">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="mt-1 h-14 w-full rounded-lg" />
            </div>
          </div>
        </div>

        <div className="hidden w-16 shrink-0 flex-col gap-3 border-l border-line bg-panel p-2 lg:flex">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
      <span className="sr-only">{m.recordingEditor.skeleton.status}</span>
    </div>
  );
}
