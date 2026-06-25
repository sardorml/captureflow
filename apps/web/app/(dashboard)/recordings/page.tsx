import { getWorkspaceById, listMembers } from "@captureflow/quota";
import { requireSession } from "@/lib/session-guard";
import { getAppWebEnv } from "@/lib/cf-env";
import { listRecordingsForWorkspace } from "@/lib/recordings-db";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import { RecordingsList } from "../../RecordingsList";
import { PageHeader } from "../PageHeader";

export const dynamic = "force-dynamic";

export default async function RecordingsPage() {
  // Re-check: the layout's session narrowing doesn't cross the segment boundary.
  const session = await requireSession();

  const current = await resolveCurrentWorkspace(
    session.user.id,
    session.user.name ?? null,
  );
  const viewingOwnWorkspace = current.role === "owner";

  const env = await getAppWebEnv();
  const [recordings, members, workspaceRow] = await Promise.all([
    listRecordingsForWorkspace(current.workspace.id, session.user.id),
    env?.DB ? listMembers(env.DB, current.workspace.id) : Promise.resolve([]),
    env?.DB
      ? getWorkspaceById(env.DB, current.workspace.id)
      : Promise.resolve(null),
  ]);
  const allowPublicLinks = workspaceRow?.allow_public_links ?? true;
  const ownerNames = new Map<string, string>(
    members.map((m) => [m.user_id, m.name?.trim() || m.email]),
  );
  const ownerImages: Record<string, string> = {};
  for (const m of members) {
    if (m.image) ownerImages[m.user_id] = m.image;
  }

  const subtitle = `${recordings.length} recording${recordings.length === 1 ? "" : "s"}`;

  return (
    <>
      <PageHeader
        eyebrow={current.workspace.name}
        title="Recordings"
        subtitle={subtitle}
      />
      <div className="mt-6">
        <RecordingsList
          recordings={recordings}
          viewerUserId={session.user.id}
          viewerIsWorkspaceOwner={viewingOwnWorkspace}
          allowPublicLinks={allowPublicLinks}
          workspaceName={current.workspace.name}
          ownerNames={Object.fromEntries(ownerNames)}
          ownerImages={ownerImages}
        />
      </div>
    </>
  );
}
