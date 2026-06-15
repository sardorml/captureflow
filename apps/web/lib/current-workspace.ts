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

// Cookie-backed "current workspace" for the dashboard. v1 always
// rendered the user's personal workspace; v2 lets a user with multiple
// workspaces (their own + any they accepted invites to) flip which
// workspace the dashboard pages scope to.
//
// The cookie just holds a workspace id. Validity is re-checked on
// every request — if the cookie points at a workspace the user no
// longer belongs to (revoked invitation, deleted workspace), we
// silently fall back to their personal workspace so the dashboard
// can't be hard-wedged by a stale cookie.

export const CURRENT_WORKSPACE_COOKIE = 'captureflow-workspace';

export type CurrentWorkspace = {
  workspace: WorkspaceRow;
  role: WorkspaceRole;
  // All workspaces the user belongs to. Hand-off to the switcher
  // dropdown so we don't re-query in the header component.
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

  // Cookie store is read-only inside Server Components; that's all we
  // need here (writes go through the server action).
  const cookieStore = await cookies();
  const requested = cookieStore.get(CURRENT_WORKSPACE_COOKIE)?.value ?? null;

  // Validate the cookie's workspace against the user's membership set —
  // if it's not in the list we treat it as missing.
  const inMembership = memberships.find((m) => m.workspace_id === requested);
  if (requested && inMembership) {
    const row = await getWorkspaceById(env.DB, requested);
    if (row) {
      return { workspace: row, role: inMembership.role, memberships };
    }
  }

  // Fall back to the personal workspace. ensurePersonalWorkspace
  // double-covers the edge case where a brand-new account hits the
  // dashboard before the signup hook persisted a row.
  const personal = await ensurePersonalWorkspace(env.DB, userId, userName);
  // Owner role by definition for the personal workspace.
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
