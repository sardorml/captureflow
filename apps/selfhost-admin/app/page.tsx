import Link from "next/link";
import {
  getInstanceSignupState,
  listInstanceTeams,
  listInstanceUsers,
} from "@captureflow/selfhost/instance";
import { requireAdmin } from "@/lib/session";
import { Actions, Badge, Button, Card, Cell, Table } from "./_ui";
import { setAdminAction, setOpenSignupAction } from "./actions";
import { CreateWorkspaceForm } from "./forms";

export default async function AdminPage() {
  const { DB } = await requireAdmin();
  const [teams, users, signup] = await Promise.all([
    listInstanceTeams(DB),
    listInstanceUsers(DB),
    getInstanceSignupState(DB),
  ]);
  const adminCount = users.filter((u) => u.is_admin).length;

  return (
    <>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-fg-strong">
          Admin
        </h1>
        <p className="mt-2 text-base text-fg-muted">
          Create workspaces, add people and choose who runs this CaptureFlow.
        </p>
      </div>

      <Card
        title="Workspaces"
        description="Create a workspace for each team, then invite people to it."
      >
        <div className="flex flex-col gap-5">
          <CreateWorkspaceForm />
          {teams.length > 0 && (
            <Table head={["Name", "Owner", "People"]}>
              {teams.map((team) => (
                <tr key={team.id}>
                  <Cell>
                    <Link
                      href={`/workspaces/${team.id}`}
                      className="font-medium text-fg-strong underline-offset-4 hover:underline"
                    >
                      {team.name}
                    </Link>
                  </Cell>
                  <Cell>{team.owner_name || team.owner_email}</Cell>
                  <Cell className="text-right">{team.member_count}</Cell>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </Card>

      <Card
        title="People"
        description="Admins can open this page and manage every workspace."
      >
        <Table head={["Name", "Email", "Access"]}>
          {users.map((user) => (
            <tr key={user.id}>
              <Cell className="font-medium text-fg-strong">{user.name}</Cell>
              <Cell>{user.email}</Cell>
              <Actions>
                {user.is_admin && <Badge>Admin</Badge>}
                {!(user.is_admin && adminCount === 1) && (
                  <form action={setAdminAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <input
                      type="hidden"
                      name="admin"
                      value={String(!user.is_admin)}
                    />
                    <Button type="submit" variant="secondary" size="sm">
                      {user.is_admin ? "Remove admin" : "Make admin"}
                    </Button>
                  </form>
                )}
              </Actions>
            </tr>
          ))}
        </Table>
      </Card>

      <Card title="Sign-up" description="Choose who can create an account.">
        <form
          action={setOpenSignupAction}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <p className="text-base text-fg">
            {signup.open
              ? "Anyone who can open this site can create an account."
              : "Only people you invite can create an account."}
          </p>
          <input type="hidden" name="open" value={String(!signup.open)} />
          <Button type="submit" variant="secondary">
            {signup.open ? "Switch to invite-only" : "Open sign-up"}
          </Button>
        </form>
      </Card>
    </>
  );
}
