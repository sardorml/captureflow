import { Skeleton } from "@heroui/react";
import { ListToolbarSkeleton, MediaGridSkeleton } from "../_skeletons";
import { PageHeader } from "../PageHeader";

export default function Loading() {
  return (
    <>
      <PageHeader
        title="Recordings"
        subtitle={
          <Skeleton className="inline-block h-3.5 w-24 rounded align-middle" />
        }
      />
      <div className="mt-6">
        <ListToolbarSkeleton />
        <MediaGridSkeleton />
      </div>
    </>
  );
}
