import { Skeleton } from "@/components/ui/skeleton";
import { InlineSkeleton, WorkspaceFormsSkeleton } from "../../_skeletons";
import { SettingsCard, WorkspacePageHeader } from "../../WorkspacePageHeader";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <WorkspacePageHeader
        workspaceName={<InlineSkeleton className="h-3.5 w-40" />}
        title="Workspace Settings"
      />
      <div className="flex flex-col gap-6">
        <div className="flex gap-6 border-b border-line">
          <Skeleton className="mb-3 h-5 w-16 rounded" />
          <Skeleton className="mb-3 h-5 w-16 rounded" />
        </div>
        <SettingsCard
          title="General"
          description="The name and logo that identify this workspace in the switcher, on the members page and on share previews."
        >
          <WorkspaceFormsSkeleton />
        </SettingsCard>
      </div>
    </div>
  );
}
