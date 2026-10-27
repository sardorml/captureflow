"use client";

import type { ReactNode } from "react";
import { Card, Separator, Skeleton, Typography } from "@heroui/react";
import { cn } from "@/lib/utils";

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
    <Card className="gap-0 overflow-hidden border border-line p-0 shadow-none">
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

function NavRowSkeleton({ width }: { width: string }) {
  return (
    <div className="flex h-9 items-center gap-3 px-3">
      <Skeleton className="size-[18px] shrink-0 rounded-md" />
      <Skeleton className={cn("h-3.5 rounded", width)} />
    </div>
  );
}

function SubNavRowSkeleton({ width }: { width: string }) {
  return (
    <div className="flex h-8 items-center px-3">
      <Skeleton className={cn("h-3 rounded", width)} />
    </div>
  );
}

// Stands in for the sidebar while its workspace queries run, box for box:
// brand, workspace card, the grouped nav with Settings' sub-pages, and the
// upgrade card at the foot.
export function SidebarSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 p-5">
        <Skeleton className="size-7 rounded-lg" />
        <Skeleton className="h-5 w-28 rounded-md" />
      </div>
      <div className="px-3 pb-3">
        <div className="rounded-xl border border-line bg-panel">
          <div className="flex h-[38px] items-center justify-between gap-2 px-3 pt-2.5 pb-1">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="size-3.5 rounded" />
          </div>
          <div className="flex h-[30px] items-center gap-2 px-3 pb-2.5">
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <div className="flex items-center gap-2 border-t border-line px-3 py-2">
            <div className="flex -space-x-2">
              <Skeleton className="size-8 rounded-full ring-2 ring-panel" />
              <Skeleton className="size-8 rounded-full ring-2 ring-panel" />
            </div>
            <Skeleton className="size-8 rounded-full" />
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <div className="flex flex-col px-3">
          <div className="flex flex-col gap-0.5">
            <NavRowSkeleton width="w-20" />
            <NavRowSkeleton width="w-22" />
            <NavRowSkeleton width="w-24" />
            <NavRowSkeleton width="w-16" />
          </div>
          <hr className="my-2 border-line" />
          <div className="flex flex-col gap-0.5">
            <NavRowSkeleton width="w-18" />
            <NavRowSkeleton width="w-16" />
            <div className="ml-[21px] flex flex-col gap-0.5 border-l border-line pl-2">
              <SubNavRowSkeleton width="w-16" />
              <SubNavRowSkeleton width="w-20" />
              <SubNavRowSkeleton width="w-12" />
            </div>
          </div>
          <hr className="my-2 border-line" />
          <NavRowSkeleton width="w-28" />
        </div>
      </div>
      <div className="px-3 pt-3 pb-4">
        <div className="rounded-2xl bg-panel p-4 ring-1 ring-line">
          <div className="flex h-5 items-center">
            <Skeleton className="h-3.5 w-40 rounded" />
          </div>
          <div
            className="mt-1 flex flex-col justify-around py-1.5"
            style={{ height: 80 }}
          >
            <Skeleton className="h-2.5 w-full rounded" />
            <Skeleton className="h-2.5 w-11/12 rounded" />
            <Skeleton className="h-2.5 w-4/5 rounded" />
            <Skeleton className="h-2.5 w-1/4 rounded" />
          </div>
          <Skeleton className="mt-3 h-9 w-full rounded-full" />
        </div>
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

// A skeleton that sits in a line of text, for a count or a subtitle. Rendered
// as a span so the parser does not close the paragraph around it.
export function InlineSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton
      render={(p) => <span {...p} />}
      className={cn("inline-block rounded align-middle", className)}
    />
  );
}

// A labelled card, as the settings-style pages lay them out.
export function SectionSkeleton({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section>
      <Typography type="body-sm" weight="semibold" className="mb-2 block">
        {label}
      </Typography>
      <Card className="p-5">{children}</Card>
    </section>
  );
}

// The label-over-track meter both pages draw for storage use.
export function MeterSkeleton({ gap = "mt-2" }: { gap?: "mt-2" | "mt-5" }) {
  return (
    <div>
      <div className="flex h-6 items-center justify-between gap-3">
        <Skeleton className="h-3.5 w-16 rounded" />
        <Skeleton className="h-3.5 w-28 rounded" />
      </div>
      <Skeleton className={cn("h-2.5 w-full rounded-full", gap)} />
    </div>
  );
}

// A labelled text field with its description line, at TextField's rows.
function FieldSkeleton({ hint = true }: { hint?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex h-5 items-center">
        <Skeleton className="h-3.5 w-24 rounded" />
      </div>
      <Skeleton className="h-9 w-full rounded-xl" />
      {hint && (
        <div className="flex h-5 items-center">
          <Skeleton className="h-3 w-56 max-w-full rounded" />
        </div>
      )}
    </div>
  );
}

// Settings → Account: the avatar picker, the two-column name and email
// fields, the user id and the save button.
export function AccountFormSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Typography type="body-sm" weight="medium" className="mb-2 block">
          Avatar
        </Typography>
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 shrink-0 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-8 w-[119px] rounded-xl" />
            <div className="flex h-5 items-center">
              <Skeleton className="h-3 w-48 rounded" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
        <FieldSkeleton />
        <Skeleton className="h-9 w-[123px] rounded-xl" />
      </div>
    </div>
  );
}

// Settings → Workspace: the name form over the logo form, split by the
// same separator.
export function WorkspaceFormsSkeleton() {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex min-w-60 flex-1 flex-col gap-1">
          <Typography weight="semibold">Workspace name</Typography>
          <div className="flex h-5 items-center">
            <Skeleton className="h-3 w-80 max-w-full rounded" />
          </div>
        </div>
        <div className="flex w-full max-w-96 flex-col gap-2">
          <Skeleton className="h-9 w-full rounded-xl" />
          <div className="flex justify-end">
            <Skeleton className="h-9 w-16 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex min-w-60 flex-1 flex-col gap-1">
          <Typography weight="semibold">Workspace logo</Typography>
          <div className="flex h-10 items-center">
            <Skeleton className="h-8 w-full max-w-md rounded" />
          </div>
        </div>
        <div className="flex w-full max-w-96 items-center gap-4">
          <Skeleton className="size-14 shrink-0 rounded-full" />
          <div className="flex flex-1 justify-end">
            <Skeleton className="h-9 w-[131px] rounded-xl" />
          </div>
        </div>
      </div>
    </>
  );
}

// Settings → the two policy choices under a one-line explanation.
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
