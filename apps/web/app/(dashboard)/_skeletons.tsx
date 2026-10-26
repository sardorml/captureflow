"use client";

import { Card, Separator, Skeleton } from "@heroui/react";

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

// Mirrors MediaCard box for box (thumbnail, byline, two-line title, stats
// row), so the real card lands on the same pixels.
export function MediaCardSkeleton() {
  return (
    <Card className="gap-0 overflow-hidden border border-black/[0.15] p-0 shadow-none dark:border-white/[0.16]">
      <Skeleton className="aspect-video w-full rounded-none" />
      <Card.Content className="flex flex-col gap-3 p-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex h-6 items-center">
              <Skeleton className="h-3.5 w-32 rounded" />
            </div>
            <div className="-mt-1 flex h-5 items-center">
              <Skeleton className="h-2.5 w-12 rounded" />
            </div>
          </div>
        </div>
        <div className="flex min-h-[2lh] flex-col justify-center gap-2 text-[15px]">
          <Skeleton className="h-3.5 w-11/12 rounded" />
          <Skeleton className="h-3.5 w-3/5 rounded" />
        </div>
        <Separator />
        <div className="flex h-8 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-3.5 w-8 rounded" />
            <Skeleton className="h-3.5 w-8 rounded" />
            <Skeleton className="h-3.5 w-8 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-3.5 w-14 rounded" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}

// Same columns and gutters as the recordings and screenshots grids.
export function MediaGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Select-all on the left, two filter buttons on the right, at ListToolbar's
// sizes.
export function ListToolbarSkeleton() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex h-5 items-center gap-3">
        <Skeleton className="size-[18px] rounded-md" />
        <Skeleton className="h-3.5 w-36 rounded" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-28 rounded-xl md:h-8" />
        <Skeleton className="h-9 w-40 rounded-xl md:h-8" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return <MediaGridSkeleton count={count} />;
}

// Stands in for the sidebar while its workspace queries run.
export function SidebarSkeleton() {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Skeleton className="h-8 w-40 rounded-md" />
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-lg" />
        ))}
      </div>
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
