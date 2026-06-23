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

export const CURRENT_WORKSPACE_COOKIE = 'captureflow-workspace';

export type CurrentWorkspace = {
  workspace: WorkspaceRow;
  role: WorkspaceRole;
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

  const cookieStore = await cookies();
  const requested = cookieStore.get(CURRENT_WORKSPACE_COOKIE)?.value ?? null;

  const inMembership = memberships.find((m) => m.workspace_id === requested);
  if (requested && inMembership) {
    const row = await getWorkspaceById(env.DB, requested);
    if (row) {
      return { workspace: row, role: inMembership.role, memberships };
    }
  }

  // ensurePersonalWorkspace also covers a brand-new account hitting the
  // dashboard before the signup hook persisted a row.
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
