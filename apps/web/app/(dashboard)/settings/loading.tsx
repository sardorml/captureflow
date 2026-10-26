import {
  AccountFormSkeleton,
  PolicyGridSkeleton,
  SectionSkeleton,
  WorkspaceFormsSkeleton,
} from "../_skeletons";
import { PageHeader } from "../PageHeader";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[880px]">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences."
        showRecord={false}
      />
      <div className="mt-6 flex flex-col gap-8">
        <SectionSkeleton label="Account">
          <AccountFormSkeleton />
        </SectionSkeleton>
        <SectionSkeleton label="Workspace">
          <WorkspaceFormsSkeleton />
        </SectionSkeleton>
        <SectionSkeleton label="Access & viewing">
          <PolicyGridSkeleton />
        </SectionSkeleton>
        <SectionSkeleton label="Recording access">
          <PolicyGridSkeleton />
        </SectionSkeleton>
      </div>
    </div>
  );
}
