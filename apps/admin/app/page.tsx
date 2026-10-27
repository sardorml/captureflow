import NextLink from "next/link";
import { Table } from "@heroui/react";
import {
  getAdminTotals,
  getSignupsByWeek,
  listAdminUsers,
  listAudit,
} from "@captureflow/admin";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import {
  DataTable,
  Empty,
  Notice,
  PageHeader,
  PersonCell,
  PlanChip,
  Stat,
  StatGrid,
  Tone,
  formatBytes,
  formatRelative,
} from "./_ui";
import { PanelTabs } from "./_filters";

function ViewAll({ href, label }: { href: string; label: string }) {
  return (
    <NextLink
      href={href}
      className="text-fg-muted hover:text-fg w-fit text-sm transition-colors motion-reduce:transition-none"
    >
      {label} →
    </NextLink>
  );
}

function share(value: number, total: number): string {
  return `${total ? Math.round((value / total) * 100) : 0}% of users`;
}

export default async function OverviewPage() {
  await requirePermission("users.read");
  const env = await getAdminEnv();
  if (!env?.DB) return <Notice tone="error">No database binding.</Notice>;

  const [totals, signups, newest, heaviest, audit] = await Promise.all([
    getAdminTotals(env.DB),
    getSignupsByWeek(env.DB),
    listAdminUsers(env.DB, { search: "", page: 1, plan: "all", pageSize: 8 }),
    listAdminUsers(env.DB, {
      search: "",
      page: 1,
      plan: "all",
      sort: "storage",
      pageSize: 8,
    }),
    listAudit(env.DB, 8),
  ]);
  const thisWeek = signups[signups.length - 1] ?? 0;
  const quarter = signups.reduce((a, b) => a + b, 0);
  const free = totals.users - totals.teamUsers;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Overview" />

      <StatGrid columns={6}>
        <Stat
          label="Users"
          value={totals.users.toLocaleString()}
          hint={`+${thisWeek} this week · +${quarter} in 12 weeks`}
        />
        <Stat
          label="Free"
          value={free.toLocaleString()}
          hint={share(free, totals.users)}
        />
        <Stat
          label="Paid"
          value={totals.teamUsers.toLocaleString()}
          hint={share(totals.teamUsers, totals.users)}
        />
        <Stat
          label="Paid workspaces"
          value={totals.paidWorkspaces.toLocaleString()}
          hint={`of ${totals.teamWorkspaces} team`}
        />
        <Stat
          label="Workspaces"
          value={totals.workspaces.toLocaleString()}
          hint={`${totals.teamWorkspaces} team`}
        />
        <Stat
          label="Stored"
          value={formatBytes(totals.storageBytes)}
          hint={`${totals.recordings.toLocaleString()} recordings · ${totals.screenshots.toLocaleString()} screenshots`}
        />
      </StatGrid>

      <PanelTabs
        label="Activity"
        items={[
          {
            id: "newest",
            label: "Newest users",
            content: (
              <div className="flex flex-col gap-3">
                <DataTable
                  label="Newest users"
                  columns={["User", "Plan", "Joined"]}
                >
                  {newest.rows.map((u) => (
                    <Table.Row key={u.id}>
                      <Table.Cell>
                        <PersonCell id={u.id} name={u.name} email={u.email} />
                      </Table.Cell>
                      <Table.Cell>
                        <PlanChip plan={u.plan} />
                      </Table.Cell>
                      <Table.Cell className="text-fg-muted whitespace-nowrap">
                        {formatRelative(u.createdAt)}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </DataTable>
                <ViewAll href="/users" label="All users" />
              </div>
            ),
          },
          {
            id: "storage",
            label: "Most storage",
            content: (
              <div className="flex flex-col gap-3">
                <DataTable
                  label="Most storage"
                  columns={["User", "Plan", "Recordings", "Stored"]}
                >
                  {heaviest.rows.map((u) => (
                    <Table.Row key={u.id}>
                      <Table.Cell>
                        <PersonCell id={u.id} name={u.name} email={u.email} />
                      </Table.Cell>
                      <Table.Cell>
                        <PlanChip plan={u.plan} />
                      </Table.Cell>
                      <Table.Cell className="tabular-nums">
                        {u.recordingCount}
                      </Table.Cell>
                      <Table.Cell className="tabular-nums whitespace-nowrap">
                        {formatBytes(u.storageBytes)}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </DataTable>
                <ViewAll href="/users?sort=storage" label="All by storage" />
              </div>
            ),
          },
          {
            id: "audit",
            label: "Admin activity",
            content:
              audit.length === 0 ? (
                <Empty title="No admin activity yet">
                  Every change made from this panel is logged here.
                </Empty>
              ) : (
                <div className="flex flex-col gap-3">
                  <DataTable
                    label="Admin activity"
                    columns={["Action", "Target", "By", "When"]}
                  >
                    {audit.map((a) => (
                      <Table.Row key={a.id}>
                        <Table.Cell>
                          <Tone color="default">{a.action}</Tone>
                        </Table.Cell>
                        <Table.Cell className="text-fg-muted max-w-xs truncate">
                          {a.targetType === "user" ? (
                            <NextLink
                              href={`/users/${a.targetId}`}
                              className="hover:underline"
                            >
                              user/{a.targetId}
                            </NextLink>
                          ) : (
                            `${a.targetType}/${a.targetId}`
                          )}
                        </Table.Cell>
                        <Table.Cell className="text-fg-muted">
                          {a.actor}
                        </Table.Cell>
                        <Table.Cell className="text-fg-muted whitespace-nowrap">
                          {formatRelative(a.createdAt)}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </DataTable>
                  <ViewAll href="/audit" label="Full audit log" />
                </div>
              ),
          },
        ]}
      />
    </div>
  );
}
