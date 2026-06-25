import { Alert } from "antd";
import { listMembers, listPendingInvites } from "@captureflow/quota";
import { requireSession } from "@/lib/session-guard";
import { getAppWebEnv } from "@/lib/cf-env";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import { PendingInvites } from "./PendingInvites";
import { MembersList } from "./MembersList";
import { PageHeader } from "../PageHeader";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const session = await requireSession();
  const env = await getAppWebEnv();
  if (!env?.DB) {
    return (
      <>
        <PageHeader title="Members" showRecord={false} />
        <Alert
          className="mt-6"
          type="warning"
          showIcon
          message="Database unavailable."
        />
      </>
    );
  }

  const current = await resolveCurrentWorkspace(
    session.user.id,
    session.user.name ?? null,
  );
  const workspace = current.workspace;
  const isOwner = current.role === "owner";

  const [members, pending] = await Promise.all([
    listMembers(env.DB, workspace.id),
    isOwner ? listPendingInvites(env.DB, workspace.id) : Promise.resolve([]),
  ]);

  return (
    <>
      <PageHeader
        eyebrow={workspace.name}
        title="Members"
        subtitle={
          isOwner
            ? "Invite teammates to share recordings and screenshots privately."
            : `You're a member of this workspace.`
        }
        showRecord={false}
      />
      <div className="mt-6 space-y-8">
        {pending.length > 0 && (
          <PendingInvites invites={pending} canRevoke={isOwner} />
        )}
        <MembersList
          members={members}
          viewerUserId={session.user.id}
          viewerIsOwner={isOwner}
        />
      </div>
    </>
  );
}
