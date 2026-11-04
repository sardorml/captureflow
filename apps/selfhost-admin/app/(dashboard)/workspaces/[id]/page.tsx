import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminWorkspace, listAdminRecordings } from "@captureflow/admin";
import { listMembers, listPendingInvites } from "@captureflow/quota";
import { formatBytes, plural } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { DangerForm } from "@/app/_danger";
import { RecordingsTable } from "@/app/_recordings";
import {
  Actions,
  Badge,
  Button,
  Card,
  Cell,
  PageHeader,
  Stat,
  Stats,
  Table,
} from "@/app/_ui";
import {
  changeRoleAction,
  deleteWorkspaceAction,
  removeMemberAction,
  revokeInviteAction,
} from "@/app/actions";
import { InviteForm } from "@/app/forms";

const ROLE_NAME = { owner: "Owner", member: "Member", viewer: "Viewer" };

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { DB, APP_URL } = await requireAdmin();
  const { id } = await params;
  const workspace = await getAdminWorkspace(DB, id);
  if (!workspace) notFound();

  const [members, invites, recordings] = await Promise.all([
    listMembers(DB, id),
    listPendingInvites(DB, id),
    listAdminRecordings(DB, {
      search: "",
      page: 1,
      visibility: "all",
      pageSize: 10,
      workspaceId: id,
    }),
  ]);
  const personal = workspace.kind === "personal";

  return (
    <>
      <PageHeader
        title={workspace.name}
        description={
          personal
            ? `${workspace.owner.name || workspace.owner.email}'s personal workspace.`
            : `Owned by ${workspace.owner.name || workspace.owner.email}.`
        }
        back={{ href: "/workspaces", label: "All workspaces" }}
      >
        <Badge tone="muted">{personal ? "Personal" : "Team"}</Badge>
      </PageHeader>

      <Stats>
        <Stat label="People" value={workspace.memberCount} />
        <Stat label="Invited" value={workspace.pendingInvites} />
        <Stat
          label="Recordings"
          value={workspace.recordingCount}
          hint={`${plural(workspace.screenshotCount, "screenshot")} too`}
        />
        <Stat label="Storage" value={formatBytes(workspace.storageBytes)} />
      </Stats>

      {!personal && (
        <Card
          title="Invite people"
          description="Members record into this workspace. Viewers watch and comment."
        >
          <InviteForm workspaceId={id} />
        </Card>
      )}

      <Card
        title={`People (${members.length})`}
        description="Removing someone keeps what they recorded in this workspace."
      >
        <Table head={["Name", "Email", "Role", ""]}>
          {members.map((member) => (
            <tr key={member.user_id}>
              <Cell className="font-medium text-fg-strong">
                <Link
                  href={`/people/${member.user_id}`}
                  className="underline-offset-4 hover:underline"
                >
                  {member.name}
                </Link>
              </Cell>
              <Cell>{member.email}</Cell>
              <Cell>{ROLE_NAME[member.role]}</Cell>
              <Actions>
                {member.role !== "owner" && (
                  <>
                    <form action={changeRoleAction}>
                      <input type="hidden" name="workspaceId" value={id} />
                      <input
                        type="hidden"
                        name="userId"
                        value={member.user_id}
                      />
                      <input
                        type="hidden"
                        name="role"
                        value={member.role === "member" ? "viewer" : "member"}
                      />
                      <Button type="submit" variant="secondary" size="sm">
                        {member.role === "member"
                          ? "Make viewer"
                          : "Make member"}
                      </Button>
                    </form>
                    <form action={removeMemberAction}>
                      <input type="hidden" name="workspaceId" value={id} />
                      <input
                        type="hidden"
                        name="userId"
                        value={member.user_id}
                      />
                      <Button type="submit" variant="secondary" size="sm">
                        Remove
                      </Button>
                    </form>
                  </>
                )}
              </Actions>
            </tr>
          ))}
        </Table>
      </Card>

      {invites.length > 0 && (
        <Card
          title={`Waiting to join (${invites.length})`}
          description="To get a new link, invite the same address again. The old link stops working."
        >
          <Table head={["Email", "Role", ""]}>
            {invites.map((invite) => (
              <tr key={invite.id}>
                <Cell className="font-medium text-fg-strong">
                  {invite.email}
                </Cell>
                <Cell>{ROLE_NAME[invite.role]}</Cell>
                <Actions>
                  <form action={revokeInviteAction}>
                    <input type="hidden" name="workspaceId" value={id} />
                    <input type="hidden" name="inviteId" value={invite.id} />
                    <Button type="submit" variant="secondary" size="sm">
                      Cancel invite
                    </Button>
                  </form>
                </Actions>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      <Card
        title="Recordings"
        description={
          recordings.total > recordings.rows.length
            ? `The latest 10 of ${recordings.total}.`
            : undefined
        }
      >
        <RecordingsTable
          rows={recordings.rows}
          appUrl={APP_URL}
          show={{ owner: true }}
        />
      </Card>

      {!personal && (
        <Card
          title="Delete workspace"
          description="Removes the workspace with every recording and screenshot in it. People keep their accounts."
        >
          <DangerForm
            action={deleteWorkspaceAction}
            fields={{ workspaceId: id }}
            label="Delete workspace"
            pendingLabel="Deleting…"
            confirm={`Delete "${workspace.name}" and its ${plural(workspace.recordingCount, "recording")}? This can't be undone.`}
          />
        </Card>
      )}
    </>
  );
}
