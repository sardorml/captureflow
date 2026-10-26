import { Skeleton } from "@heroui/react";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-[218px] rounded-3xl" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-[150px] rounded-xl" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="min-h-56 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
