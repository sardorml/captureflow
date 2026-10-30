import { Skeleton } from "@/components/ui/skeleton";
import { InlineSkeleton } from "../_skeletons";
import { WorkspacePageHeader } from "../WorkspacePageHeader";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <WorkspacePageHeader
        workspaceName={<InlineSkeleton className="h-3.5 w-40" />}
        title="Members"
      />
      <section className="rounded-2xl bg-panel ring-1 ring-line">
        <div className="px-6 pt-6 pb-5">
          <h2 className="text-2xl font-semibold tracking-tight text-fg-strong">
            People <InlineSkeleton className="h-4 w-8" />
          </h2>
          <p className="mt-1 text-base text-fg-muted">
            <InlineSkeleton className="h-3.5 w-96 max-w-full" />
          </p>
        </div>
        <div className="flex flex-col gap-4 border-t border-line px-6 py-6">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-10 w-full rounded-xl sm:w-72" />
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="ml-auto h-10 w-40 rounded-xl" />
          </div>
          <Skeleton className="h-11 rounded-xl" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <Skeleton className="h-3.5 w-32 rounded" />
              <Skeleton className="ml-auto h-3.5 w-24 rounded" />
              <Skeleton className="h-3.5 w-28 rounded" />
              <Skeleton className="h-3.5 w-48 rounded" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
