import { Skeleton } from "@heroui/react";
import { MeterSkeleton, SectionSkeleton } from "../_skeletons";
import { PageHeader } from "../PageHeader";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[880px]">
      <PageHeader
        title="Billing"
        subtitle="Your plan, and what you've used of it."
        showRecord={false}
      />
      <div className="mt-6 flex flex-col gap-8">
        <SectionSkeleton label="Plan">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex h-6 items-center">
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <div className="mt-2 flex h-6 items-center">
                <Skeleton className="h-3.5 w-80 max-w-full rounded" />
              </div>
            </div>
            <Skeleton className="h-10 w-36 shrink-0 rounded-xl" />
          </div>
        </SectionSkeleton>
        <SectionSkeleton label="Usage">
          <MeterSkeleton />
        </SectionSkeleton>
      </div>
    </div>
  );
}
