import { Alert } from "@heroui/react";
import { listMembers, listPendingInvites } from "@captureflow/quota";
import { requireSession } from "@/lib/session-guard";
import { getAppWebEnv } from "@/lib/cf-env";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import { WorkspacePageHeader } from "../WorkspacePageHeader";
import { MembersTable } from "./MembersTable";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const session = await requireSession();
  const env = await getAppWebEnv();
  const current = await resolveCurrentWorkspace(
    session.user.id,
    session.user.name ?? null,
  );
  const workspace = current.workspace;
  const isOwner = current.role === "owner";

  if (!env?.DB) {
    return (
      <div className="flex flex-col gap-8">
        <WorkspacePageHeader workspaceName={workspace.name} title="Members" />
        <Alert status="warning">
          <Alert.Content>
            <Alert.Title>Database unavailable.</Alert.Title>
          </Alert.Content>
        </Alert>
      </div>
    );
  }

  const [members, pending] = await Promise.all([
    listMembers(env.DB, workspace.id),
    isOwner ? listPendingInvites(env.DB, workspace.id) : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <WorkspacePageHeader workspaceName={workspace.name} title="Members" />
      <MembersTable
        members={members}
        invites={pending}
        viewerUserId={session.user.id}
        viewerIsOwner={isOwner}
        workspaceName={workspace.name}
      />
    </div>
  );
}
