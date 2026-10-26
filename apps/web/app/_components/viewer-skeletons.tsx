import { Skeleton } from "@heroui/react";
import { AppIcon } from "@/components/brand-mark";
import { PRODUCT_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

// ViewerNav's shell: the real brand on the left, placeholders for the action
// buttons and the account cluster on the right.
export function ViewerNavSkeleton({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "flex h-16 w-full items-center justify-between bg-canvas-2 px-4 sm:px-6",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <AppIcon size={28} />
        <span className="text-xl font-semibold tracking-tight text-fg-strong">
          {PRODUCT_NAME}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-9 w-9 rounded-full sm:w-36" />
      </div>
    </header>
  );
}

export function ViewerHeadlineSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex h-9 items-center lg:h-8">
        <Skeleton className="h-6 w-72 max-w-full rounded-md" />
      </div>
      <div className="mt-1 flex h-5 items-center">
        <Skeleton className="h-3.5 w-40 rounded" />
      </div>
    </div>
  );
}
