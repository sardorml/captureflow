import { redirect } from "next/navigation";
import { getWorkspaceById } from "@captureflow/quota";
import { requireSession } from "@/lib/session-guard";
import { getAppWebEnv } from "@/lib/cf-env";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
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

  const logoUrl = workspace.logo_key
    ? `${CDN_BASE_URL}/${workspace.logo_key}?v=${workspace.updated_at}`
    : null;

  const general = (
    <SettingsCard
      title="General"
      description="The name and logo that identify this workspace in the switcher, on the members page and on share previews."
    >
      <WorkspaceNameForm initialName={workspace.name} />
      <WorkspaceLogoForm logoUrl={logoUrl} workspaceName={workspace.name} />
    </SettingsCard>
  );

  const security = (
    <SettingsCard
      title="Default permissions"
      description="Settings applied to every new recording and screenshot in the workspace."
    >
      <SettingsRow
        title="Recording access"
        description="Decide whether teammates can post recordings and screenshots into this workspace."
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
        title="Workspace Settings"
      />
      <SettingsTabs
        tabs={[
          { id: "general", label: "General", content: general },
          { id: "security", label: "Security", content: security },
        ]}
      />
    </div>
  );
}
