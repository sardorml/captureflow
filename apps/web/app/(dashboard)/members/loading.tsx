import { Skeleton } from "@heroui/react";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-50 rounded-md" />
        <Skeleton className="h-4 w-full max-w-md rounded-md" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
