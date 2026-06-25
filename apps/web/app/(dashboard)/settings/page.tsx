import { getWorkspaceById } from "@captureflow/quota";
import { redirect } from "next/navigation";
import { Card, Divider, Flex } from "antd";
import { requireSession } from "@/lib/session-guard";
import { getAppWebEnv } from "@/lib/cf-env";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import { PageHeader } from "../PageHeader";
import { WorkspaceNameForm } from "./WorkspaceNameForm";
import { WorkspaceLogoForm } from "./WorkspaceLogoForm";
import { AccessPolicy } from "./AccessPolicy";
import { MemberUploadsPolicy } from "./MemberUploadsPolicy";

export const dynamic = "force-dynamic";

const CDN_BASE =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "https://cdn.captureflow.xyz";

export default async function WorkspaceSettingsPage() {
  const session = await requireSession();
  const current = await resolveCurrentWorkspace(
    session.user.id,
    session.user.name ?? null,
  );
  if (current.role !== "owner") redirect("/shares");

  const env = await getAppWebEnv();
  const workspace = env?.DB
    ? await getWorkspaceById(env.DB, current.workspace.id)
    : null;
  if (!workspace) redirect("/shares");

  const logoUrl = workspace.logo_key
    ? `${CDN_BASE}/${workspace.logo_key}?v=${workspace.updated_at}`
    : null;

  return (
    <>
      <PageHeader
        eyebrow={workspace.name}
        title="Workspace settings"
        subtitle="Branding, sharing policies, and content access."
        showRecord={false}
      />
      <Flex vertical gap={24} style={{ marginTop: 24 }}>
        <Card
          title="General"
          extra={
            <span className="text-sm text-fg-muted">
              Applied to every new recording and snap in this workspace.
            </span>
          }
        >
          <WorkspaceNameForm initialName={workspace.name} />
          <Divider />
          <WorkspaceLogoForm logoUrl={logoUrl} workspaceName={workspace.name} />
        </Card>

        <Card title="Access & viewing">
          <p className="mb-4 text-sm text-fg-muted">
            Control whether content from this workspace can leave the team.
          </p>
          <AccessPolicy allowPublicLinks={workspace.allow_public_links} />
        </Card>

        <Card title="Recording access">
          <p className="mb-4 text-sm text-fg-muted">
            Decide whether teammates can post recordings + snaps into this
            workspace.
          </p>
          <MemberUploadsPolicy
            allowMemberUploads={workspace.allow_member_uploads}
          />
        </Card>
      </Flex>
    </>
  );
}
