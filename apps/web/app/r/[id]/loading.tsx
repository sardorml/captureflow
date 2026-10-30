import { Skeleton } from "@/components/ui/skeleton";
import {
  ViewerHeadlineSkeleton,
  ViewerNavSkeleton,
} from "@/app/_components/viewer-skeletons";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-panel text-fg lg:h-screen lg:overflow-hidden">
      <ViewerNavSkeleton className="border-b border-black/[0.06] bg-panel dark:border-white/[0.07]" />
      <div className="grid w-full grid-cols-1 bg-panel lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-1 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <main className="flex flex-col bg-stage lg:min-h-0 lg:overflow-hidden">
          <ViewerHeadlineSkeleton className="bg-panel px-6 py-5 sm:px-8" />
          <div className="mx-auto w-full max-w-5xl py-6">
            <Skeleton className="aspect-video w-full rounded-2xl max-sm:rounded-none" />
          </div>
        </main>
        <aside className="hidden flex-col border-l border-black/[0.06] bg-panel lg:flex dark:border-white/[0.07]">
          <div className="flex h-12 items-center gap-5 border-b border-black/[0.06] px-5 dark:border-white/[0.07]">
            <Skeleton className="h-3.5 w-14 rounded" />
            <Skeleton className="h-3.5 w-16 rounded" />
            <Skeleton className="h-3.5 w-12 rounded" />
          </div>
          <div className="flex flex-col gap-4 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-2/5 rounded" />
                  <Skeleton className="h-3.5 w-4/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
