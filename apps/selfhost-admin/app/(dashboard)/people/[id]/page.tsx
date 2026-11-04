import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAdminUser,
  listAdminRecordings,
  listUserWorkspaces,
} from "@captureflow/admin";
import {
  countInstanceAdmins,
  isInstanceAdmin,
} from "@captureflow/selfhost/instance";
import { formatAgo, formatBytes, formatDate, plural } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { DangerForm } from "@/app/_danger";
import { RecordingsTable } from "@/app/_recordings";
import {
  Badge,
  Button,
  Card,
  Cell,
  Empty,
  PageHeader,
  Stat,
  Stats,
  Table,
} from "@/app/_ui";
import {
  deleteUserAction,
  setAdminAction,
  signOutUserAction,
} from "@/app/actions";

const ROLE_NAME = { owner: "Owner", member: "Member", viewer: "Viewer" };

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { DB, APP_URL, user: me } = await requireAdmin();
  const { id } = await params;
  const user = await getAdminUser(DB, id);
  if (!user) notFound();

  const [workspaces, recordings, admin, adminCount] = await Promise.all([
    listUserWorkspaces(DB, id),
    listAdminRecordings(DB, {
      search: "",
      page: 1,
      visibility: "all",
      pageSize: 10,
      userId: id,
    }),
    isInstanceAdmin(DB, id),
    countInstanceAdmins(DB),
  ]);
  const lastAdmin = admin && adminCount === 1;

  return (
    <>
      <PageHeader
        title={user.name || user.email}
        description={user.email}
        back={{ href: "/people", label: "All people" }}
      >
        <div className="flex items-center gap-2">
          {admin && <Badge>Admin</Badge>}
          {id === me.id && <Badge tone="muted">You</Badge>}
        </div>
      </PageHeader>

      <Stats>
        <Stat label="Joined" value={formatDate(user.createdAt)} />
        <Stat label="Last active" value={formatAgo(user.lastActiveAt)} />
        <Stat
          label="Recordings"
          value={user.recordingCount}
          hint={`${plural(user.screenshotCount, "screenshot")} too`}
        />
        <Stat label="Storage" value={formatBytes(user.storageBytes)} />
      </Stats>

      <Card title="Workspaces">
        {workspaces.length === 0 ? (
          <Empty>Not in any workspace.</Empty>
        ) : (
          <Table head={["Name", "Kind", "Role", "People"]}>
            {workspaces.map((w) => (
              <tr key={w.id}>
                <Cell>
                  <Link
                    href={`/workspaces/${w.id}`}
                    className="font-medium text-fg-strong underline-offset-4 hover:underline"
                  >
                    {w.name}
                  </Link>
                </Cell>
                <Cell>{w.kind === "team" ? "Team" : "Personal"}</Cell>
                <Cell>{w.role ? ROLE_NAME[w.role] : "—"}</Cell>
                <Cell className="text-right">{w.memberCount}</Cell>
              </tr>
            ))}
          </Table>
        )}
      </Card>

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
          show={{ workspace: true }}
        />
      </Card>

      <Card
        title="Access"
        description="Admins open this admin and manage every workspace."
      >
        <div className="flex flex-col gap-4">
          <Row
            title={admin ? "Admin of this CaptureFlow" : "Not an admin"}
            body={
              lastAdmin
                ? "The only admin. Make someone else an admin before removing this one."
                : admin
                  ? "Can create workspaces, invite people and change who signs up."
                  : "Can only use the workspaces they belong to."
            }
          >
            {!lastAdmin && (
              <form action={setAdminAction}>
                <input type="hidden" name="userId" value={id} />
                <input type="hidden" name="admin" value={String(!admin)} />
                <Button type="submit" variant="secondary">
                  {admin ? "Remove admin" : "Make admin"}
                </Button>
              </form>
            )}
          </Row>
          <Row
            title="Sign out everywhere"
            body={`Ends ${plural(user.activeSessions, "browser session")} and ${plural(user.activeDevices, "connected app")}. They can sign in again.`}
          >
            <DangerForm
              action={signOutUserAction}
              fields={{ userId: id }}
              label="Sign out"
              pendingLabel="Signing out…"
              variant="secondary"
              confirm={`Sign ${user.name || user.email} out of every browser and app?`}
            />
          </Row>
          <Row
            title="Delete account"
            body="Removes the account with its personal workspace, recordings and screenshots. Team workspaces they own have to go first."
          >
            <DangerForm
              action={deleteUserAction}
              fields={{ userId: id }}
              label="Delete account"
              pendingLabel="Deleting…"
              confirm={`Delete ${user.name || user.email} and everything they recorded? This can't be undone.`}
            />
          </Row>
        </div>
      </Card>
    </>
  );
}

function Row({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-tint p-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-fg-strong">{title}</p>
        <p className="text-sm text-fg-muted">{body}</p>
      </div>
      {children}
    </div>
  );
}
