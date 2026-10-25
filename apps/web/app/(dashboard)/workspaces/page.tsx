import { Alert } from "@heroui/react";
import {
  countWorkspaceMembers,
  countWorkspaceRecordings,
} from "@captureflow/quota";
import { requireSession } from "@/lib/session-guard";
import { getAppWebEnv } from "@/lib/cf-env";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import { workspaceLogoUrl } from "@/lib/site";
import { PageHeader } from "../PageHeader";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";
import { WorkspacesList, type WorkspaceCardData } from "./WorkspacesList";

export const dynamic = "force-dynamic";

export default async function WorkspacesPage() {
  const session = await requireSession();
  const env = await getAppWebEnv();
  if (!env?.DB) {
    return (
      <>
        <PageHeader title="Workspaces" showRecord={false} />
        <Alert className="mt-6" status="warning">
          <Alert.Content>
            <Alert.Title>Database unavailable.</Alert.Title>
          </Alert.Content>
        </Alert>
      </>
    );
  }
  const db = env.DB;

  const current = await resolveCurrentWorkspace(
    session.user.id,
    session.user.name ?? null,
  );
  const workspaces: WorkspaceCardData[] = await Promise.all(
    current.memberships.map(async (m) => {
      const [memberCount, recordingCount] = await Promise.all([
        countWorkspaceMembers(db, m.workspace_id),
        countWorkspaceRecordings(db, m.workspace_id),
      ]);
      return {
        id: m.workspace_id,
        name: m.workspace_name,
        kind: m.workspace_kind,
        role: m.role,
        logoUrl: workspaceLogoUrl(m.workspace_logo_key, m.workspace_updated_at),
        memberCount,
        recordingCount,
        isDefault: m.workspace_id === current.workspace.id,
      };
    }),
  );

  return (
    <>
      <PageHeader
        title="Workspaces"
        subtitle="Every workspace you own or joined. New recordings and screenshots save to the default one, from the extension and the desktop app too."
        actions={<CreateWorkspaceModal />}
        showRecord={false}
      />
      <WorkspacesList workspaces={workspaces} />
    </>
  );
}
