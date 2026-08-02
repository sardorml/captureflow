import { Card, Skeleton } from "@heroui/react";
import { PageHeader } from "../PageHeader";

export default function Loading() {
  return (
    <>
      <PageHeader title="Notifications" showRecord={false} />
      <Card className="mt-10 space-y-3 p-4">
        <Skeleton className="h-5 w-2/5 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-4/5 rounded-md" />
      </Card>
    </>
  );
}
