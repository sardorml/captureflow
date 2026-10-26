import { Skeleton } from "@heroui/react";
import { InlineSkeleton, MeterSkeleton, SectionSkeleton } from "../_skeletons";
import { PageHeader } from "../PageHeader";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[880px]">
      <PageHeader
        title="Storage"
        subtitle={<InlineSkeleton className="h-3.5 w-40" />}
        showRecord={false}
      />
      <div className="mt-6 flex flex-col gap-8">
        <SectionSkeleton label="Usage">
          <MeterSkeleton gap="mt-5" />
        </SectionSkeleton>
        <SectionSkeleton label="What takes up space">
          <ul className="-my-3 divide-y divide-line">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="flex h-5 items-center">
                    <Skeleton className="h-3.5 w-2/5 rounded" />
                  </div>
                  <div className="flex h-4 items-center">
                    <Skeleton className="h-3 w-1/4 rounded" />
                  </div>
                </div>
                <Skeleton className="h-3.5 w-12 rounded" />
              </li>
            ))}
          </ul>
        </SectionSkeleton>
      </div>
    </div>
  );
}
