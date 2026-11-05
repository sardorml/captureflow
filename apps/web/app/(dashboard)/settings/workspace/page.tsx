import { redirect } from "next/navigation";
import { getWorkspaceById } from "@captureflow/quota";
import { requireSession } from "@/lib/session-guard";
import { getAppWebEnv } from "@/lib/cf-env";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import { getAppI18n } from "@/lib/i18n/app/server";
import { CDN_BASE_URL } from "@/lib/site";
import { SettingsCard, WorkspacePageHeader } from "../../WorkspacePageHeader";
import { MemberUploadsPolicy } from "../MemberUploadsPolicy";
import { SettingsRow } from "../SettingsRow";
import { SettingsTabs } from "../SettingsTabs";
import { WorkspaceLogoForm } from "../WorkspaceLogoForm";
import { WorkspaceNameForm } from "../WorkspaceNameForm";

export const dynamic = "force-dynamic";

export default async function WorkspaceSettingsPage() {
  const session = await requireSession();
  const user = session.user;
  const current = await resolveCurrentWorkspace(user.id, user.name ?? null);
  const env = await getAppWebEnv();

  const workspace =
    current.role === "owner" && env?.DB
      ? await getWorkspaceById(env.DB, current.workspace.id)
      : null;
  if (!workspace) redirect("/settings/personal");
  const { messages: m } = await getAppI18n();

  const logoUrl = workspace.logo_key
    ? `${CDN_BASE_URL}/${workspace.logo_key}?v=${workspace.updated_at}`
    : null;

  const general = (
    <SettingsCard
      title={m.settings.workspace.general.title}
      description={m.settings.workspace.general.description}
    >
      <WorkspaceNameForm initialName={workspace.name} />
      <WorkspaceLogoForm logoUrl={logoUrl} workspaceName={workspace.name} />
    </SettingsCard>
  );

  const security = (
    <SettingsCard
      title={m.settings.workspace.permissions.title}
      description={m.settings.workspace.permissions.description}
    >
      <SettingsRow
        title={m.settings.workspace.recordingAccess.title}
        description={m.settings.workspace.recordingAccess.description}
        stacked
      >
        <MemberUploadsPolicy
          allowMemberUploads={workspace.allow_member_uploads}
        />
      </SettingsRow>
    </SettingsCard>
  );

  return (
    <div className="flex flex-col gap-8">
      <WorkspacePageHeader
        workspaceName={current.workspace.name}
        title={m.settings.workspace.title}
      />
      <SettingsTabs
        tabs={[
          {
            id: "general",
            label: m.settings.workspace.tabs.general,
            content: general,
          },
          {
            id: "security",
            label: m.settings.workspace.tabs.security,
            content: security,
          },
        ]}
      />
    </div>
  );
}
