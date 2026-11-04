import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getWorkspaceById,
  listMembers,
  listPendingInvites,
} from "@captureflow/quota";
import { requireAdmin } from "@/lib/session";
import { Actions, Button, Card, Cell, Table } from "../../_ui";
import {
  changeRoleAction,
  removeMemberAction,
  revokeInviteAction,
} from "../../actions";
import { InviteForm } from "../../forms";

const ROLE_NAME = { owner: "Owner", member: "Member", viewer: "Viewer" };

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { DB } = await requireAdmin();
  const { id } = await params;
  const workspace = await getWorkspaceById(DB, id);
  if (!workspace) notFound();

  const [members, invites] = await Promise.all([
    listMembers(DB, id),
    listPendingInvites(DB, id),
  ]);

  return (
    <>
      <div>
        <Link
          href="/"
          className="text-sm text-fg-muted underline-offset-4 hover:underline"
        >
          Back to Admin
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-fg-strong">
          {workspace.name}
        </h1>
      </div>

      <Card
        title="Invite people"
        description="Members record into this workspace. Viewers watch and comment."
      >
        <InviteForm workspaceId={id} />
      </Card>

      <Card
        title={`People (${members.length})`}
        description="Removing someone keeps what they recorded in this workspace."
      >
        <Table head={["Name", "Email", "Role", ""]}>
          {members.map((member) => (
            <tr key={member.user_id}>
              <Cell className="font-medium text-fg-strong">{member.name}</Cell>
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
    </>
  );
}
