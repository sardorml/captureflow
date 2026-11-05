import { redirect } from "next/navigation";
import { findInviteByToken, getWorkspaceById } from "@captureflow/quota";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { loadSession } from "@/lib/session-guard";
import { getAppWebEnv } from "@/lib/cf-env";
import { getAppI18n } from "@/lib/i18n/app/server";
import { fill } from "@/lib/i18n/fill";
import { fmt } from "@/lib/i18n/format";
import { acceptInviteAction } from "../../(dashboard)/members/actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const env = await getAppWebEnv();
  const session = await loadSession();

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(`/invite/${token}`)}`);
  }

  const { messages: m } = await getAppI18n();

  if (!env?.DB) {
    return <ErrorFrame title={m.auth.invite.databaseUnavailable} />;
  }

  const invite = await findInviteByToken(env.DB, token);
  if (!invite) {
    return (
      <ErrorFrame
        title={m.auth.invite.invalidTitle}
        body={m.auth.invite.invalidBody}
      />
    );
  }

  if (invite.email.toLowerCase() !== session.user.email.toLowerCase()) {
    return (
      <ErrorFrame
        title={m.auth.invite.wrongAccountTitle}
        body={fmt(m.auth.invite.wrongAccountBody, {
          invited: invite.email,
          current: session.user.email,
        })}
        signOut
      />
    );
  }

  const workspace = await getWorkspaceById(env.DB, invite.workspace_id);
  const workspaceName = workspace?.name ?? m.auth.inviteFallbacks.workspace;

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-6 text-fg">
      <Card className="block w-full max-w-110 p-6">
        <h1 className="text-2xl font-bold text-fg-strong">
          {m.auth.invite.title}
        </h1>
        <p className="mt-3 text-fg-muted">
          {fill(
            invite.role === "viewer"
              ? m.auth.invite.asViewer
              : m.auth.invite.asMember,
            {
              workspace: (
                <strong className="text-fg-strong">{workspaceName}</strong>
              ),
            },
          )}
        </p>
        <form action={acceptInviteAction} className="mt-6">
          <input type="hidden" name="token" value={token} />
          <Button type="submit" className="w-full">
            {m.auth.invite.accept}
          </Button>
        </form>
        <p className="mt-4 text-xs text-fg-subtle">
          {fmt(m.auth.signedInAs, { email: session.user.email })}
        </p>
      </Card>
    </div>
  );
}

async function ErrorFrame({
  title,
  body,
  signOut,
}: {
  title: string;
  body?: string;
  signOut?: boolean;
}) {
  const { messages: m } = await getAppI18n();
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-6 text-fg">
      <Card className="block w-full max-w-110 p-6 text-center">
        <h1 className="text-xl font-semibold text-fg-strong">{title}</h1>
        {body && <p className="mt-2 text-sm text-fg-muted">{body}</p>}
        <div className="mt-6 flex items-center justify-center gap-2">
          <a href="/" className={buttonVariants({ variant: "secondary" })}>
            {m.auth.invite.goToDashboard}
          </a>
          {signOut && (
            <a href="/auth/clear" className={buttonVariants()}>
              {m.auth.invite.signOut}
            </a>
          )}
        </div>
      </Card>
    </div>
  );
}
