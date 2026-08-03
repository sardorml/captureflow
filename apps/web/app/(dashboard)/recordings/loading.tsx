import { Card, Skeleton } from "@heroui/react";
import { PageHeader } from "../PageHeader";

export default function Loading() {
  return (
    <>
      <PageHeader title="Recordings" />
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="mt-3 h-4 w-3/5 rounded-md" />
          </Card>
        ))}
      </div>
    </>
  );
}
