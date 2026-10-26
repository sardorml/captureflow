import { Skeleton } from "@heroui/react";
import { InlineSkeleton } from "../_skeletons";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-fg-strong">
            Welcome back
          </h1>
          <p className="mt-2 text-base text-fg-muted">
            <InlineSkeleton className="h-3.5 w-64" />
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[156px] rounded-xl" />
          <Skeleton className="hidden h-10 w-[150px] rounded-xl md:block" />
        </div>
      </header>
      <Skeleton className="h-[96px] rounded-2xl" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Skeleton className="h-6 w-40 rounded-md" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2.5">
                <Skeleton className="aspect-video w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/3 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-[248px] rounded-2xl" />
          <Skeleton className="h-[300px] rounded-2xl" />
          <Skeleton className="h-[200px] rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
