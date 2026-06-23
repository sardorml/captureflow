'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  acceptInvite,
  createInvite,
  findInviteByToken,
  removeWorkspaceMember,
  revokeInvite,
} from '@captureflow/quota';
import { getAuth } from '@/lib/auth';
import { getAppWebEnv } from '@/lib/cf-env';
import {
  CURRENT_WORKSPACE_COOKIE,
  resolveCurrentWorkspace,
} from '@/lib/current-workspace';
import { sendWorkspaceInviteEmail } from '@/lib/email';

// Actions can be replayed directly, so each re-verifies session and ownership rather than trusting the UI gate.

type FormState = {
  error: string | null;
  ok: string | null;
};

async function requireSession(): Promise<{
  userId: string;
  name: string | null;
  email: string;
}> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect('/login');
  }
  return {
    userId: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email,
  };
}

function getBaseUrl(): string {
  return process.env.APP_WEB_PUBLIC_URL ?? 'https://captureflow.xyz';
}

export async function inviteMemberAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireSession();
  const env = await getAppWebEnv();
  if (!env?.DB) return { error: 'Database unavailable', ok: null };

  const emailRaw = formData.get('email');
  const email = typeof emailRaw === 'string' ? emailRaw.trim() : '';
  if (!email) return { error: 'Enter an email address', ok: null };
  // Loose check suffices: the recipient must sign in with this exact address to accept, so a typo just no-ops.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'That doesn’t look like a valid email', ok: null };
  }
  if (email.toLowerCase() === session.email.toLowerCase()) {
    return { error: 'You’re already in your own workspace', ok: null };
  }

  // Re-check ownership so a forged submission can't bypass the owner-only UI gate.
  const current = await resolveCurrentWorkspace(session.userId, session.name);
  if (current.role !== 'owner') {
    return {
      error: 'Only the workspace owner can invite teammates',
      ok: null,
    };
  }
  const workspace = current.workspace;

  const result = await createInvite(env.DB, {
    workspaceId: workspace.id,
    email,
    invitedByUserId: session.userId,
  });

  if (!result.ok) {
    if (result.reason === 'already_member') {
      return {
        error: 'That person is already a member of this workspace',
        ok: null,
      };
    }
    return { error: 'Could not create the invitation', ok: null };
  }

  const acceptUrl = `${getBaseUrl()}/invite/${result.plaintextToken}`;
  const sent = await sendWorkspaceInviteEmail({
    to: email,
    inviterName: session.name,
    inviterEmail: session.email,
    workspaceName: workspace.name,
    acceptUrl,
  });

  revalidatePath('/members');

  if (!sent) {
    return {
      error:
        'Invitation created but email delivery failed. Copy the link from the pending list.',
      ok: null,
    };
  }
  return { error: null, ok: `Invitation sent to ${email}` };
}

export async function revokeInviteAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const env = await getAppWebEnv();
  if (!env?.DB) return;

  const inviteId = formData.get('inviteId');
  if (typeof inviteId !== 'string' || !inviteId) return;

  const current = await resolveCurrentWorkspace(session.userId, session.name);
  if (current.role !== 'owner') return;

  await revokeInvite(env.DB, {
    inviteId,
    workspaceId: current.workspace.id,
  });
  revalidatePath('/members');
}

// Only the membership row is removed; the member's shares and snaps stay in the workspace.
export async function removeMemberAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const env = await getAppWebEnv();
  if (!env?.DB) return;

  const memberUserId = formData.get('userId');
  if (typeof memberUserId !== 'string' || !memberUserId) return;

  const current = await resolveCurrentWorkspace(session.userId, session.name);
  if (current.role !== 'owner') return;
  if (memberUserId === session.userId) return;

  await removeWorkspaceMember(env.DB, current.workspace.id, memberUserId);
  revalidatePath('/members');
}

// Clears the current-workspace cookie so the next render falls back to the caller's personal workspace.
export async function leaveWorkspaceAction(): Promise<void> {
  const session = await requireSession();
  const env = await getAppWebEnv();
  if (!env?.DB) return;

  const current = await resolveCurrentWorkspace(session.userId, session.name);
  if (current.role === 'owner') return;

  const result = await removeWorkspaceMember(
    env.DB,
    current.workspace.id,
    session.userId
  );
  if (result.ok) {
    const cookieStore = await cookies();
    cookieStore.delete(CURRENT_WORKSPACE_COOKIE);
  }
  revalidatePath('/members');
  redirect('/shares');
}

// The signed-in email must match the invite recipient, or a stolen link could join workspaces it wasn't invited to.
export async function acceptInviteAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const env = await getAppWebEnv();
  if (!env?.DB) redirect('/shares?invite=db-unavailable');

  const token = formData.get('token');
  if (typeof token !== 'string' || !token) redirect('/shares?invite=invalid');

  const invite = await findInviteByToken(env.DB, token);
  if (!invite) redirect('/shares?invite=invalid');

  if (invite.email.toLowerCase() !== session.email.toLowerCase()) {
    redirect('/shares?invite=email-mismatch');
  }

  const result = await acceptInvite(env.DB, {
    inviteId: invite.id,
    userId: session.userId,
  });

  if (!result.ok) {
    if (result.reason === 'already_member') {
      redirect('/shares?invite=already-member');
    }
    redirect('/shares?invite=invalid');
  }

  revalidatePath('/members');
  redirect('/members?invite=accepted');
}
