import { getAppI18n } from "@/lib/i18n/app/server";
import { AccountFormSkeleton } from "../../_skeletons";
import { PageHeader } from "../../PageHeader";
import { SettingsCard } from "../../WorkspacePageHeader";

export default async function Loading() {
  const { messages: m } = await getAppI18n();
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={m.settings.personal.title} showRecord={false} />
      <SettingsCard
        title={m.settings.personal.account.title}
        description={m.settings.personal.account.description}
      >
        <AccountFormSkeleton />
      </SettingsCard>
    </div>
  );
}
