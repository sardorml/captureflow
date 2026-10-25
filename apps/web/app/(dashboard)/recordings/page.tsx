import { preconnect } from "react-dom";
import { getWorkspaceById, listMembers } from "@captureflow/quota";
import { requireSession } from "@/lib/session-guard";
import { R2_PUBLIC_BASE_URL } from "@/lib/site";
import { getAppWebEnv } from "@/lib/cf-env";
import {
  countRecordingsForWorkspace,
  listRecordingsForWorkspace,
  type DashboardRecordingRow,
} from "@/lib/recordings-db";
import { viewerMediaUrl } from "@/lib/recording/media-url";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import {
  PAGE_SIZE,
  hydratePageNumber,
  pageCount,
  pageOffset,
} from "@/lib/pagination";
import { RecordingsList, type RecordingCardRow } from "../../RecordingsList";
import { Pager } from "../../_components/Pager";
import { PageHeader } from "../PageHeader";

export const dynamic = "force-dynamic";

export default async function RecordingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  // Re-check: the layout's session narrowing doesn't cross the segment boundary.
  const session = await requireSession();

  const current = await resolveCurrentWorkspace(
    session.user.id,
    session.user.name ?? null,
  );
  const viewingOwnWorkspace = current.role === "owner";

  const env = await getAppWebEnv();
  const total = await countRecordingsForWorkspace(
    current.workspace.id,
    session.user.id,
  );
  const page = hydratePageNumber((await searchParams).page, total);
  const [recordings, members, workspaceRow] = await Promise.all([
    listRecordingsForWorkspace(current.workspace.id, session.user.id, {
      limit: PAGE_SIZE,
      offset: pageOffset(page),
    }),
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

  const cards = await Promise.all(recordings.map(toCardRow));
  // Public posters come from the CDN host: open that connection with the HTML.
  if (recordings.some((r) => r.visibility === "public")) {
    preconnect(env?.R2_PUBLIC_BASE_URL ?? R2_PUBLIC_BASE_URL);
  }
  const subtitle = `${total} recording${total === 1 ? "" : "s"}`;

  return (
    <>
      <PageHeader
        eyebrow={current.workspace.name}
        title="Recordings"
        subtitle={subtitle}
      />
      <div className="mt-6">
        <RecordingsList
          recordings={cards}
          viewerUserId={session.user.id}
          viewerIsWorkspaceOwner={viewingOwnWorkspace}
          allowPublicLinks={allowPublicLinks}
          workspaceName={current.workspace.name}
          ownerNames={Object.fromEntries(ownerNames)}
          ownerImages={ownerImages}
        />
        <Pager page={page} pageCount={pageCount(total)} />
      </div>
    </>
  );
}

async function toCardRow({
  storageKey,
  posterKey,
  posterThumbKey,
  webcamStorageKey,
  ...row
}: DashboardRecordingRow): Promise<RecordingCardRow> {
  // The card-sized thumbnail where the cron or the upload has made one.
  const posterSource = posterThumbKey ?? posterKey;
  const posterUrl = posterSource
    ? await viewerMediaUrl(row, posterSource)
    : null;
  const videoThumbUrl =
    row.state === "ready" && !posterUrl
      ? `${await viewerMediaUrl(row, storageKey)}?v=${row.sizeBytes}`
      : null;
  return { ...row, posterUrl, videoThumbUrl };
}
