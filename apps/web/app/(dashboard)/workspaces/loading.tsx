import { Skeleton } from "@heroui/react";
import { WorkspacesListSkeleton } from "../_skeletons";
import { PageHeader } from "../PageHeader";

export default function Loading() {
  return (
    <>
      <PageHeader
        title="Workspaces"
        subtitle="Every workspace you own or joined. New recordings and screenshots save to the default one, from the extension and the desktop app too."
        actions={<Skeleton className="h-9 w-[156px] rounded-xl" />}
        showRecord={false}
      />
      <WorkspacesListSkeleton />
    </>
  );
}
