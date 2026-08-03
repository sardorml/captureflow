import { Skeleton } from "@heroui/react";

export default function Loading() {
  return (
    <>
      <div className="space-y-2">
        <Skeleton className="h-7 w-60 rounded-md" />
        <Skeleton className="h-4 w-full max-w-md rounded-md" />
      </div>
      <div className="mt-6 flex items-center gap-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-3/5 rounded-md" />
      </div>
    </>
  );
}
