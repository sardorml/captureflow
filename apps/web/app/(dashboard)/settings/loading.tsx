import { Skeleton } from "@heroui/react";
import {
  AccountFormSkeleton,
  InlineSkeleton,
  WorkspaceFormsSkeleton,
} from "../_skeletons";
import { SettingsCard, WorkspacePageHeader } from "../WorkspacePageHeader";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <WorkspacePageHeader
        workspaceName={<InlineSkeleton className="h-3.5 w-40" />}
        title="Settings"
      />
      <div className="flex flex-col gap-6">
        <div className="flex gap-6 border-b border-line">
          <Skeleton className="mb-3 h-5 w-16 rounded" />
          <Skeleton className="mb-3 h-5 w-14 rounded" />
        </div>
        <div className="flex flex-col gap-6">
          <SettingsCard
            title="Workspace"
            description="The name and logo that appear in the switcher, on the members page and on share previews."
          >
            <WorkspaceFormsSkeleton />
          </SettingsCard>
          <SettingsCard
            title="Account"
            description="How you appear to teammates and to the people who watch your recordings."
          >
            <AccountFormSkeleton />
          </SettingsCard>
        </div>
      </div>
    </div>
  );
}
