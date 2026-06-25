import { redirect } from "next/navigation";
import { findInviteByToken, getWorkspaceById } from "@captureflow/quota";
import { Button, Card, Flex, Result } from "antd";
import { loadSession } from "@/lib/session-guard";
import { getAppWebEnv } from "@/lib/cf-env";
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
  const workspaceName = workspace?.name ?? "a CaptureFlow workspace";

  return (
    <Flex
      align="center"
      justify="center"
      className="bg-canvas text-fg"
      style={{ minHeight: "100vh", padding: 24 }}
    >
      <Card style={{ width: "100%", maxWidth: 440 }}>
        <h1 className="text-2xl font-bold text-fg-strong">
          You&rsquo;re invited
        </h1>
        <p className="mt-3 text-fg-muted">
          You&rsquo;ve been invited to join{" "}
          <strong className="text-fg-strong">{workspaceName}</strong> on
          CaptureFlow. Workspaces let teammates recording screen recordings and
          screenshots privately.
        </p>
        <form action={acceptInviteAction} style={{ marginTop: 24 }}>
          <input type="hidden" name="token" value={token} />
          <Button type="primary" htmlType="submit" block>
            Accept invitation
          </Button>
        </form>
        <p className="mt-4 text-xs text-fg-subtle">
          Signed in as {session.user.email}.
        </p>
      </Card>
    </Flex>
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
    <Flex
      align="center"
      justify="center"
      className="bg-canvas text-fg"
      style={{ minHeight: "100vh", padding: 24 }}
    >
      <Result
        status="warning"
        title={title}
        subTitle={body}
        extra={[
          <Button key="home" href="/">
            Go to dashboard
          </Button>,
          signOut ? (
            <Button key="signout" type="primary" href="/auth/clear">
              Sign out
            </Button>
          ) : null,
        ]}
      />
    </Flex>
  );
}
