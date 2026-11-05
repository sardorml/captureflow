import { Skeleton } from "@/components/ui/skeleton";
import { getAppI18n } from "@/lib/i18n/app/server";
import { InlineSkeleton, WorkspaceFormsSkeleton } from "../../_skeletons";
import { SettingsCard, WorkspacePageHeader } from "../../WorkspacePageHeader";

export default async function Loading() {
  const { messages: m } = await getAppI18n();
  return (
    <div className="flex flex-col gap-8">
      <WorkspacePageHeader
        workspaceName={<InlineSkeleton className="h-3.5 w-40" />}
        title={m.settings.workspace.title}
      />
      <div className="flex flex-col gap-6">
        <div className="flex gap-6 border-b border-line">
          <Skeleton className="mb-3 h-5 w-16 rounded" />
          <Skeleton className="mb-3 h-5 w-16 rounded" />
        </div>
        <SettingsCard
          title={m.settings.workspace.general.title}
          description={m.settings.workspace.general.description}
        >
          <WorkspaceFormsSkeleton />
        </SettingsCard>
      </div>
    </div>
  );
}
