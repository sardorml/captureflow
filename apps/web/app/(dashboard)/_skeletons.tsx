"use client";

import { Card, Skeleton } from "@heroui/react";

export function PageHeaderSkeleton({
  showRecord = true,
}: {
  showRecord?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 max-w-80 flex-1 space-y-2">
        <Skeleton className="h-7 w-[55%] rounded-md" />
        <Skeleton className="h-4 w-[85%] rounded-md" />
      </div>
      {showRecord && <Skeleton className="h-9 w-35 rounded-md" />}
    </div>
  );
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="mt-3 h-4 w-3/5 rounded-md" />
        </Card>
      ))}
    </div>
  );
}

export function RowListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Card className="mt-6 p-4">
      <div className="flex flex-col gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-3/5 rounded-md" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function FormSectionsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="mt-6 flex flex-col gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="space-y-3 p-4">
          <Skeleton className="h-5 w-2/5 rounded-md" />
          <Skeleton className="h-4 w-4/5 rounded-md" />
        </Card>
      ))}
    </div>
  );
}

export function DashboardLoading({
  variant,
  showRecord = true,
}: {
  variant: "grid" | "rows" | "form" | "empty";
  showRecord?: boolean;
}) {
  return (
    <div>
      <PageHeaderSkeleton showRecord={showRecord} />
      {variant === "grid" && <CardGridSkeleton />}
      {variant === "rows" && <RowListSkeleton />}
      {variant === "form" && <FormSectionsSkeleton />}
      {variant === "empty" && (
        <Skeleton className="mt-10 h-48 w-full rounded-xl" />
      )}
    </div>
  );
}
