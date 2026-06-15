'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { listWorkspacesForUser } from '@captureflow/quota';
import { getAuth } from '@/lib/auth';
import { getAppWebEnv } from '@/lib/cf-env';
import { CURRENT_WORKSPACE_COOKIE } from '@/lib/current-workspace';

// Form-action that the WorkspaceSwitcher dropdown POSTs to. Sets the
// `captureflow-workspace` cookie to the chosen workspace id, then revalidates
// every dashboard surface so the workspace-scoped queries on /shares,
// /snaps, /members refetch under the new context.
//
// Owner of the cookie write: HTTP-only false (we only ever read it
// server-side, but it's also fine to inspect from client code if a
// future component wants to). Path is the dashboard root. 30-day
// max-age matches the better-auth session lifetime so the preference
// outlives a single tab.

export async function switchWorkspaceAction(formData: FormData): Promise<void> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const env = await getAppWebEnv();
  if (!env?.DB) return;

  const workspaceId = formData.get('workspaceId');
  if (typeof workspaceId !== 'string' || !workspaceId) return;

  // Verify the user actually belongs to the workspace they're trying to
  // switch to. Without this check a forged form submission could
  // hand the dashboard a workspace id we'd then leak rows from.
  const memberships = await listWorkspacesForUser(env.DB, session.user.id);
  const allowed = memberships.some((m) => m.workspace_id === workspaceId);
  if (!allowed) return;

  const store = await cookies();
  store.set(CURRENT_WORKSPACE_COOKIE, workspaceId, {
    path: '/',
    sameSite: 'lax',
    secure: true,
    // No HttpOnly — it's a preference, not a credential, and not
    // marking it means client-side code could read which workspace is
    // active if we ever need that.
    maxAge: 60 * 60 * 24 * 30,
  });

  // Drop all dashboard caches so the next render reads the cookie and
  // refetches under the new workspace.
  revalidatePath('/shares');
  revalidatePath('/snaps');
  revalidatePath('/members');
  revalidatePath('/devices');
}
