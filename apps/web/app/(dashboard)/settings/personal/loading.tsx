import { AccountFormSkeleton } from "../../_skeletons";
import { PageHeader } from "../../PageHeader";
import { SettingsCard } from "../../WorkspacePageHeader";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Personal Settings" showRecord={false} />
      <SettingsCard
        title="Account"
        description="How you appear to teammates and to the people who watch your recordings."
      >
        <AccountFormSkeleton />
      </SettingsCard>
    </div>
  );
}
