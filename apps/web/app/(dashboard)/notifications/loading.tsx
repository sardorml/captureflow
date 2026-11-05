import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAppI18n } from "@/lib/i18n/app/server";
import { PageHeader } from "../PageHeader";

export default async function Loading() {
  const { messages: m } = await getAppI18n();
  return (
    <>
      <PageHeader title={m.shell.notifications.title} showRecord={false} />
      <Card className="mt-10 gap-3 p-4">
        <Skeleton className="h-5 w-2/5 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-4/5 rounded-md" />
      </Card>
    </>
  );
}
