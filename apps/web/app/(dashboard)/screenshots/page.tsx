import { can, getWorkspaceById, listMembers } from "@captureflow/quota";
import { requireSession } from "@/lib/session-guard";
import { getAppWebEnv } from "@/lib/cf-env";
import { listScreenshotsForWorkspace } from "@/lib/screenshots-db";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import { hydrateListFilters } from "@/lib/list-filters";
import { ScreenshotsGrid } from "./ScreenshotsGrid";
import { PageHeader } from "../PageHeader";

export const dynamic = "force-dynamic";

export default async function ScreenshotsPage({
  searchParams,
}: {
  searchParams: Promise<{
    access?: string | string[];
    sort?: string | string[];
  }>;
}) {
  const session = await requireSession();
  const filters = hydrateListFilters(await searchParams);

  const current = await resolveCurrentWorkspace(
    session.user.id,
    session.user.name ?? null,
  );
  const viewingOwnWorkspace = current.role === "owner";

  const env = await getAppWebEnv();
  const [screenshots, members, workspaceRow] = await Promise.all([
    listScreenshotsForWorkspace(current.workspace.id, session.user.id, filters),
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

  const subtitle = `${screenshots.length} screenshot${screenshots.length === 1 ? "" : "s"}`;

  return (
    <>
      <PageHeader
        title="Screenshots"
        subtitle={subtitle}
        showRecord={can(current.role, "record")}
      />
      <div className="mt-6">
        <ScreenshotsGrid
          screenshots={screenshots}
          filters={filters}
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
