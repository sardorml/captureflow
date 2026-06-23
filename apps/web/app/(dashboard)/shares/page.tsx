import { getWorkspaceById, listMembers } from '@captureflow/quota';
import { requireSession } from '@/lib/session-guard';
import { getAppWebEnv } from '@/lib/cf-env';
import { listSharesForWorkspace } from '@/lib/shares-db';
import { resolveCurrentWorkspace } from '@/lib/current-workspace';
import { SharesList } from '../../SharesList';
import { PageHeader } from '../PageHeader';

export const dynamic = 'force-dynamic';

export default async function SharesPage() {
  // Layout already gated, but its session narrowing doesn't cross the segment
  // boundary — re-check so `session.user.id` is non-null below. Also self-heals
  // stale cookies, as in the layout.
  const session = await requireSession();

  const current = await resolveCurrentWorkspace(
    session.user.id,
    session.user.name ?? null
  );
  const viewingOwnWorkspace = current.role === 'owner';

  const env = await getAppWebEnv();
  const [shares, members, workspaceRow] = await Promise.all([
    listSharesForWorkspace(current.workspace.id, session.user.id),
    env?.DB ? listMembers(env.DB, current.workspace.id) : Promise.resolve([]),
    env?.DB
      ? getWorkspaceById(env.DB, current.workspace.id)
      : Promise.resolve(null),
  ]);
  const allowPublicLinks = workspaceRow?.allow_public_links ?? true;
  // user_id → display name for teammate owner pills; falls back to email.
  const ownerNames = new Map<string, string>(
    members.map((m) => [m.user_id, m.name?.trim() || m.email])
  );
  const ownerImages: Record<string, string> = {};
  for (const m of members) {
    if (m.image) ownerImages[m.user_id] = m.image;
  }

  const subtitle = `${shares.length} share${shares.length === 1 ? '' : 's'}`;

  return (
    <>
      <PageHeader
        eyebrow={current.workspace.name}
        title="Shares"
        subtitle={subtitle}
      />
      <div className="mt-6">
        <SharesList
          shares={shares}
          viewerUserId={session.user.id}
          viewerIsWorkspaceOwner={viewingOwnWorkspace}
          allowPublicLinks={allowPublicLinks}
          ownerNames={Object.fromEntries(ownerNames)}
          ownerImages={ownerImages}
        />
      </div>
    </>
  );
}
