import Link from 'next/link';
import { redirect } from 'next/navigation';
import { findInviteByToken, getWorkspaceById } from '@captureflow/quota';
import { loadSession } from '@/lib/session-guard';
import { getAppWebEnv } from '@/lib/cf-env';
import { acceptInviteAction } from '../../(dashboard)/members/actions';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ token: string }> };

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const env = await getAppWebEnv();
  const session = await loadSession();

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(`/invite/${token}`)}`);
  }

  if (!env?.DB) {
    return <ErrorFrame title="Database unavailable" />;
  }

  const invite = await findInviteByToken(env.DB, token);
  if (!invite) {
    return (
      <ErrorFrame
        title="Invitation no longer valid"
        body="This link has expired or already been used. Ask the workspace owner to send a new invitation."
      />
    );
  }

  if (invite.email.toLowerCase() !== session.user.email.toLowerCase()) {
    return (
      <ErrorFrame
        title="Wrong account"
        body={`This invitation was sent to ${invite.email}, but you're signed in as ${session.user.email}. Sign out and sign in with the invited address to accept.`}
        signOut
      />
    );
  }

  const workspace = await getWorkspaceById(env.DB, invite.workspace_id);
  const workspaceName = workspace?.name ?? 'a CaptureFlow workspace';

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-16">
      <div className="w-full max-w-md rounded-xl border border-line bg-neutral-900 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-neutral-50">You’re invited</h1>
        <p className="mt-3 text-neutral-300">
          You’ve been invited to join{' '}
          <strong className="text-neutral-100">{workspaceName}</strong> on
          CaptureFlow. Workspaces let teammates share screen recordings and
          screenshots privately.
        </p>
        <form action={acceptInviteAction} className="mt-6 space-y-3">
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            Accept invitation
          </button>
        </form>
        <p className="mt-4 text-xs text-neutral-500">
          Signed in as {session.user.email}.
        </p>
      </div>
    </main>
  );
}

function ErrorFrame({
  title,
  body,
  signOut,
}: {
  title: string;
  body?: string;
  signOut?: boolean;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-16">
      <div className="w-full max-w-md rounded-xl border border-line bg-neutral-900 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-neutral-50">{title}</h1>
        {body && <p className="mt-3 text-neutral-300">{body}</p>}
        <div className="mt-6 flex gap-3 text-sm">
          <Link
            href="/"
            className="rounded-md border border-line px-3 py-2 text-neutral-200 hover:bg-overlay"
          >
            Go to dashboard
          </Link>
          {signOut && (
            <Link
              href="/auth/clear"
              className="rounded-md bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-500"
            >
              Sign out
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
