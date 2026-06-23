export function PageHeaderSkeleton({
  showRecord = true,
}: {
  showRecord?: boolean;
}) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <div className="h-3 w-32 rounded bg-overlay" />
        <div className="h-7 w-44 rounded bg-overlay" />
        <div className="h-3 w-56 rounded bg-overlay" />
      </div>
      {showRecord && <div className="h-9 w-36 rounded-lg bg-overlay" />}
    </header>
  );
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-2xl border border-line bg-neutral-900/40 p-3"
        >
          <div className="aspect-video w-full rounded-xl bg-overlay" />
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-overlay" />
            <div className="h-3 w-24 rounded bg-overlay" />
          </div>
          <div className="h-5 w-3/4 rounded bg-overlay" />
          <div className="mt-2 flex items-center justify-between">
            <div className="h-3 w-20 rounded bg-overlay" />
            <div className="flex gap-1.5">
              <div className="h-7 w-7 rounded-md bg-overlay" />
              <div className="h-7 w-7 rounded-md bg-overlay" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RowListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="mt-6 divide-y divide-white/5 overflow-hidden rounded-xl border border-line bg-neutral-900/40">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-overlay" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-40 rounded bg-overlay" />
              <div className="h-3 w-28 rounded bg-overlay" />
            </div>
          </div>
          <div className="h-6 w-16 rounded-full bg-overlay" />
        </div>
      ))}
    </div>
  );
}

export function FormSectionsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="mt-6 space-y-8">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="space-y-4 rounded-2xl border border-line bg-neutral-900/40 p-5"
        >
          <div className="h-5 w-32 rounded bg-overlay" />
          <div className="h-3 w-72 rounded bg-overlay" />
          <div className="mt-2 h-10 w-full max-w-md rounded-lg bg-overlay" />
        </div>
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
    <div className="animate-pulse">
      <PageHeaderSkeleton showRecord={showRecord} />
      {variant === "grid" && <CardGridSkeleton />}
      {variant === "rows" && <RowListSkeleton />}
      {variant === "form" && <FormSectionsSkeleton />}
      {variant === "empty" && (
        <div className="mt-10 h-48 rounded-2xl border border-dashed border-line bg-neutral-900/40" />
      )}
    </div>
  );
}
