import { getWorkspaceById } from "@captureflow/quota";
import { requireSession } from "@/lib/session-guard";
import { getAppWebEnv } from "@/lib/cf-env";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import { CDN_BASE_URL } from "@/lib/site";
import { SettingsCard, WorkspacePageHeader } from "../WorkspacePageHeader";
import { AccessPolicy } from "./AccessPolicy";
import { AccountForm } from "./AccountForm";
import { MemberUploadsPolicy } from "./MemberUploadsPolicy";
import { SettingsTabs } from "./SettingsTabs";
import { WorkspaceLogoForm } from "./WorkspaceLogoForm";
import { WorkspaceNameForm } from "./WorkspaceNameForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireSession();
  const user = session.user;
  const current = await resolveCurrentWorkspace(user.id, user.name ?? null);
  const env = await getAppWebEnv();

  // Every member gets the account card; the role gates the workspace cards.
  const workspace =
    current.role === "owner" && env?.DB
      ? await getWorkspaceById(env.DB, current.workspace.id)
      : null;

  // Read the image column directly: the better-auth session payload doesn't
  // always carry it.
  let imageUrl: string | null = null;
  if (env?.DB) {
    const row = await env.DB.prepare(
      `SELECT image FROM users WHERE id = ?1 LIMIT 1`,
    )
      .bind(user.id)
      .first<{ image: string | null }>();
    imageUrl = row?.image ?? null;
  }

  const logoUrl = workspace?.logo_key
    ? `${CDN_BASE_URL}/${workspace.logo_key}?v=${workspace.updated_at}`
    : null;

  const general = (
    <>
      {workspace && (
        <SettingsCard
          title="Workspace"
          description="The name and logo that appear in the switcher, on the members page and on share previews."
        >
          <WorkspaceNameForm initialName={workspace.name} />
          <WorkspaceLogoForm logoUrl={logoUrl} workspaceName={workspace.name} />
        </SettingsCard>
      )}
      <SettingsCard
        title="Account"
        description="How you appear to teammates and to the people who watch your recordings."
      >
        <AccountForm
          userId={user.id}
          initialName={user.name ?? ""}
          email={user.email}
          imageUrl={imageUrl}
        />
      </SettingsCard>
    </>
  );

  const access = workspace ? (
    <>
      <SettingsCard
        title="Access & viewing"
        description="Control whether content from this workspace can leave the team."
      >
        <AccessPolicy allowPublicLinks={workspace.allow_public_links} />
      </SettingsCard>
      <SettingsCard
        title="Recording access"
        description="Decide whether teammates can post recordings and screenshots into this workspace."
      >
        <MemberUploadsPolicy
          allowMemberUploads={workspace.allow_member_uploads}
        />
      </SettingsCard>
    </>
  ) : undefined;

  return (
    <div className="flex flex-col gap-8">
      <WorkspacePageHeader
        workspaceName={current.workspace.name}
        title={workspace ? "Workspace Settings" : "Settings"}
      />
      <SettingsTabs general={general} access={access} />
    </div>
  );
}
