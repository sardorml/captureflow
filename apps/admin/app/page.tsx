import NextLink from "next/link";
import {
  Building2,
  Film,
  Gift,
  HardDrive,
  Image as ImageIcon,
  Sparkles,
  Users,
} from "lucide-react";
import {
  getAdminTotals,
  getSignupsByWeek,
  listAdminUsers,
  listAudit,
} from "@captureflow/admin";
import { cn } from "@captureflow/ui/cn";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import {
  Notice,
  PageHeading,
  Panel,
  PersonCell,
  PlanChip,
  Stat,
  formatBytes,
  formatRelative,
  weekLabels,
} from "./_ui";
import { SignupsChart } from "./_charts";

function ViewAll({ href }: { href: string }) {
  return (
    <NextLink
      href={href}
      className="text-fg-muted hover:text-fg shrink-0 text-sm transition-colors motion-reduce:transition-none"
    >
      View all
    </NextLink>
  );
}

function Share({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-fg-muted tabular-nums">
          {value.toLocaleString()} · {pct}%
        </span>
      </div>
      <div className="bg-tint-strong h-1.5 overflow-hidden rounded-full">
        <div className={cn("h-full", tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function OverviewPage() {
  await requirePermission("users.read");
  const env = await getAdminEnv();
  if (!env?.DB) return <Notice tone="error">No database binding.</Notice>;

  const [totals, signups, newest, heaviest, audit] = await Promise.all([
    getAdminTotals(env.DB),
    getSignupsByWeek(env.DB),
    listAdminUsers(env.DB, { search: "", page: 1, plan: "all", pageSize: 6 }),
    listAdminUsers(env.DB, {
      search: "",
      page: 1,
      plan: "all",
      sort: "storage",
      pageSize: 6,
    }),
    listAudit(env.DB, 8),
  ]);
  const thisWeek = signups[signups.length - 1] ?? 0;
  const paidOnly = totals.proUsers - totals.grantedUsers;
  const free = totals.users - totals.proUsers;
  const labels = weekLabels(signups.length);
  let running = totals.users - signups.reduce((a, b) => a + b, 0);
  const signupSeries = signups.map((n, i) => {
    running += n;
    return { week: labels[i]!, signups: n, total: running };
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Overview">
        The whole deployment at a glance.
      </PageHeading>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
        <Stat
          label="Users"
          value={totals.users.toLocaleString()}
          hint={`+${thisWeek} this week`}
          icon={<Users size={14} />}
        />
        <Stat
          label="Pro users"
          value={totals.proUsers.toLocaleString()}
          hint="Paid or granted"
          icon={<Sparkles size={14} />}
        />
        <Stat
          label="Granted plans"
          value={totals.grantedUsers.toLocaleString()}
          hint="Given from this panel"
          icon={<Gift size={14} />}
        />
        <Stat
          label="Workspaces"
          value={totals.workspaces.toLocaleString()}
          hint={`${totals.teamWorkspaces} team`}
          icon={<Building2 size={14} />}
        />
        <Stat
          label="Recordings"
          value={totals.recordings.toLocaleString()}
          hint={`${totals.screenshots.toLocaleString()} screenshots`}
          icon={<Film size={14} />}
        />
        <Stat
          label="Stored"
          value={formatBytes(totals.storageBytes)}
          hint="Ready artifacts, webcam included"
          icon={<HardDrive size={14} />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          title="Signups"
          description={`${signups.reduce((a, b) => a + b, 0)} new accounts in the last 12 weeks.`}
          className="xl:col-span-2"
        >
          <SignupsChart data={signupSeries} />
        </Panel>
        <Panel title="Plan mix" description="Where every account stands now.">
          <div className="flex flex-col gap-4">
            <Share
              label="Free"
              value={free}
              total={totals.users}
              tone="bg-fg-subtle"
            />
            <Share
              label="Pro, subscribed"
              value={paidOnly}
              total={totals.users}
              tone="bg-accent-bg"
            />
            <Share
              label="Pro, granted"
              value={totals.grantedUsers}
              total={totals.users}
              tone="bg-success"
            />
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Newest users" actions={<ViewAll href="/users" />}>
          <ul className="flex flex-col gap-3">
            {newest.rows.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between gap-3"
              >
                <PersonCell id={u.id} name={u.name} email={u.email} />
                <span className="text-fg-subtle shrink-0 text-xs">
                  {formatRelative(u.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel
          title="Most storage"
          actions={<ViewAll href="/users?sort=storage" />}
        >
          <ul className="flex flex-col gap-3">
            {heaviest.rows.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between gap-3"
              >
                <PersonCell id={u.id} name={u.name} email={u.email} />
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm tabular-nums">
                    {formatBytes(u.storageBytes)}
                  </span>
                  <PlanChip plan={u.plan} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Recent admin actions" actions={<ViewAll href="/audit" />}>
          {audit.length === 0 ? (
            <p className="text-fg-muted text-sm">Nothing yet.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {audit.map((a) => (
                <li key={a.id} className="border-line border-l-2 pl-3">
                  <div className="text-sm">
                    <span className="font-medium">{a.action}</span>{" "}
                    <span className="text-fg-muted">
                      {a.targetType === "user" ? (
                        <NextLink
                          href={`/users/${a.targetId}`}
                          className="hover:underline"
                        >
                          user
                        </NextLink>
                      ) : (
                        `${a.targetType}/${a.targetId}`
                      )}
                    </span>
                  </div>
                  <div className="text-fg-subtle text-xs">
                    {a.actor} · {formatRelative(a.createdAt)}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>
    </div>
  );
}
