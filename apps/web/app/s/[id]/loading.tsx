import { Skeleton } from "@heroui/react";
import {
  ViewerHeadlineSkeleton,
  ViewerNavSkeleton,
} from "@/app/_components/viewer-skeletons";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-fg">
      <ViewerNavSkeleton />
      <main className="flex flex-1 flex-col gap-8 px-6 py-10 sm:px-10 sm:py-12">
        <ViewerHeadlineSkeleton className="mx-auto w-full max-w-6xl" />
        <div className="mx-auto flex w-full max-w-6xl flex-1 items-start justify-center">
          <Skeleton className="aspect-video w-full rounded-2xl" />
        </div>
      </main>
    </div>
  );
}
