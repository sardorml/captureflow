/// <reference types="@cloudflare/workers-types" />

import { cookies } from 'next/headers';
import {
  ensurePersonalWorkspace,
  getWorkspaceById,
  listWorkspacesForUser,
  type WorkspaceMembership,
  type WorkspaceRole,
  type WorkspaceRow,
} from '@captureflow/quota';
import { getAppWebEnv } from './cf-env';

// Cookie-backed "current workspace" for the dashboard, letting a user with
// multiple workspaces flip which one the dashboard pages scope to.
//
// The cookie just holds a workspace id, re-validated on every request: if it
// points at a workspace the user no longer belongs to (revoked invitation,
// deleted workspace), fall back to their personal workspace so a stale cookie
// can't hard-wedge the dashboard.

export const CURRENT_WORKSPACE_COOKIE = 'captureflow-workspace';

export type CurrentWorkspace = {
  workspace: WorkspaceRow;
  role: WorkspaceRole;
  // All workspaces the user belongs to, handed to the switcher dropdown so the
  // header component doesn't re-query.
  memberships: WorkspaceMembership[];
};

export async function resolveCurrentWorkspace(
  userId: string,
  userName: string | null
): Promise<CurrentWorkspace> {
  const env = await getAppWebEnv();
  if (!env?.DB) {
    throw new Error('resolveCurrentWorkspace: DB binding unavailable');
  }
  const memberships = await listWorkspacesForUser(env.DB, userId);

  // Cookie store is read-only inside Server Components; writes go through the
  // server action.
  const cookieStore = await cookies();
  const requested = cookieStore.get(CURRENT_WORKSPACE_COOKIE)?.value ?? null;

  // A cookie workspace not in the membership set is treated as missing.
  const inMembership = memberships.find((m) => m.workspace_id === requested);
  if (requested && inMembership) {
    const row = await getWorkspaceById(env.DB, requested);
    if (row) {
      return { workspace: row, role: inMembership.role, memberships };
    }
  }

  // Fall back to the personal workspace. ensurePersonalWorkspace also covers a
  // brand-new account hitting the dashboard before the signup hook persisted a
  // row.
  const personal = await ensurePersonalWorkspace(env.DB, userId, userName);
  return {
    workspace: personal,
    role: 'owner',
    memberships:
      memberships.length > 0
        ? memberships
        : [
            {
              workspace_id: personal.id,
              workspace_slug: personal.slug,
              workspace_kind: personal.kind,
              workspace_name: personal.name,
              owner_user_id: personal.owner_user_id,
              role: 'owner',
              joined_at: personal.created_at,
            },
          ],
  };
}
