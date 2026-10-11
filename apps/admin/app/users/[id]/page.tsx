import NextLink from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  Eye,
  Film,
  FolderKanban,
  HardDrive,
  Image as ImageIcon,
  KeyRound,
  Monitor,
} from "lucide-react";
import { Chip, Table } from "@heroui/react";
import {
  STORAGE_PLANS,
  can,
  getAdminUser,
  getUserActivity,
  getUserQuota,
  getUserStorage,
  isSelfHosted,
  listAuditForTarget,
  listUserSubscriptions,
  listUserWorkspaces,
  planLabel,
} from "@captureflow/admin";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import {
  DataTable,
  Initials,
  Panel,
  PlanChip,
  Stat,
  StorageMeter,
  formatBytes,
  formatDate,
  formatDuration,
  formatRelative,
  weekLabels,
} from "../../_ui";
import { UploadsChart } from "../../_charts";
import { GrantForm } from "./GrantForm";
import { QuotaForm } from "./QuotaForm";
import { SignOutEverywhere } from "./SignOutEverywhere";

const STATE_COLOR = {
  ready: "success",
  pending: "warning",
  failed: "danger",
} as const;

function grantSummary(
  grant: { variantId: string; expiresAt: number | null },
  now: number,
): string {
  const label = planLabel(grant.variantId);
  if (!grant.expiresAt) return `${label}, no end date`;
  const day = new Date(grant.expiresAt - 1).toISOString().slice(0, 10);
  return `${label}, last day ${day}${grant.expiresAt <= now ? " (ended)" : ""}`;
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const operator = await requirePermission("users.read");
  const { id } = await params;
  const env = await getAdminEnv();
  if (!env?.DB) notFound();

  const [user, quota, storage, activity, subscriptions, workspaces, audit] =
    await Promise.all([
      getAdminUser(env.DB, id),
      getUserQuota(env.DB, id),
      getUserStorage(env.DB, id, { selfHosted: isSelfHosted(env) }),
      getUserActivity(env.DB, id),
      listUserSubscriptions(env.DB, id),
      listUserWorkspaces(env.DB, id),
      listAuditForTarget(env.DB, "user", id),
    ]);
  if (!user) notFound();
  const canWrite = can(operator.role, "users.write");
  const now = Date.now();
  const ownedTeams = workspaces.filter(
    (w) => w.kind === "team" && w.owner.id === user.id,
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <NextLink
        href="/users"
        className="text-fg-muted w-fit text-sm hover:underline"
      >
        ← Users
      </NextLink>

      <header className="border-line bg-panel flex flex-wrap items-center gap-5 rounded-xl border p-5">
        <Initials name={user.name || user.email} size="lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-fg-strong truncate text-xl font-semibold">
              {user.name || user.email}
            </h1>
            <PlanChip plan={user.plan} />
            <Chip
              size="sm"
              color={user.emailVerified ? "success" : "warning"}
              variant="secondary"
            >
              {user.emailVerified ? "Email verified" : "Email unverified"}
            </Chip>
            {user.providers.map((p) => (
              <Chip key={p} size="sm" variant="secondary">
                {p === "credential" ? "password" : p}
              </Chip>
            ))}
          </div>
          <div className="text-fg-muted text-sm">{user.email}</div>
          <div className="text-fg-subtle flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span>Joined {formatDate(user.createdAt)}</span>
            <span>Last active {formatRelative(user.lastActiveAt)}</span>
            <span className="font-mono">{user.id}</span>
          </div>
        </div>
        <div className="w-full sm:w-72">
          <StorageMeter used={storage.usedBytes} limit={storage.limitBytes} />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 2xl:grid-cols-8">
        <Stat
          label="Recordings"
          value={user.recordingCount.toLocaleString()}
          hint={`${activity.recordings30d} in the last 30 days`}
          icon={<Film size={14} />}
        />
        <Stat
          label="Screenshots"
          value={user.screenshotCount.toLocaleString()}
          hint={`${activity.screenshots30d} in the last 30 days`}
          icon={<ImageIcon size={14} />}
        />
        <Stat
          label="Views received"
          value={activity.totalViews.toLocaleString()}
          hint="Across recordings and screenshots"
          icon={<Eye size={14} />}
        />
        <Stat
          label="Recorded"
          value={formatDuration(activity.totalDurationMs)}
          hint="Total length of ready recordings"
          icon={<Clock size={14} />}
        />
        <Stat
          label="Stored"
          value={formatBytes(storage.usedBytes)}
          hint={`of ${formatBytes(storage.limitBytes)}`}
          icon={<HardDrive size={14} />}
        />
        <Stat
          label="Workspaces"
          value={String(user.workspaceCount)}
          hint={`Owns ${ownedTeams} team ${ownedTeams === 1 ? "workspace" : "workspaces"}`}
          icon={<FolderKanban size={14} />}
        />
        <Stat
          label="Browser sessions"
          value={String(user.activeSessions)}
          hint="Signed in right now"
          icon={<KeyRound size={14} />}
        />
        <Stat
          label="Connected devices"
          value={String(user.activeDevices)}
          hint="Desktop app and extension"
          icon={<Monitor size={14} />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel
            title="Activity"
            description={`${[...activity.weekly.recordings, ...activity.weekly.screenshots].reduce((a, b) => a + b, 0)} uploads in the last 12 weeks, any state.`}
          >
            <UploadsChart
              data={weekLabels(12, now).map((week, i) => ({
                week,
                recordings: activity.weekly.recordings[i] ?? 0,
                screenshots: activity.weekly.screenshots[i] ?? 0,
              }))}
            />
          </Panel>

          <Panel
            title="Recent recordings"
            description="The latest twelve, in any state."
          >
            {activity.recent.length === 0 ? (
              <p className="text-fg-muted text-sm">No recordings yet.</p>
            ) : (
              <DataTable
                label="Recent recordings"
                columns={[
                  "Recording",
                  "State",
                  "Visibility",
                  "Length",
                  "Size",
                  "Views",
                  "Created",
                ]}
              >
                {activity.recent.map((r) => (
                  <Table.Row key={r.slug}>
                    <Table.Cell>
                      <div className="max-w-xs truncate font-medium">
                        {r.title || "Untitled"}
                      </div>
                      <div className="text-fg-subtle text-xs">
                        <span className="font-mono">{r.slug}</span>
                        {r.workspaceName ? ` · ${r.workspaceName}` : ""}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Chip
                        size="sm"
                        color={
                          STATE_COLOR[r.state as keyof typeof STATE_COLOR] ??
                          "default"
                        }
                      >
                        {r.state}
                      </Chip>
                    </Table.Cell>
                    <Table.Cell className="text-fg-muted">
                      {r.visibility}
                    </Table.Cell>
                    <Table.Cell className="tabular-nums whitespace-nowrap">
                      {r.durationMs ? formatDuration(r.durationMs) : "—"}
                    </Table.Cell>
                    <Table.Cell className="tabular-nums whitespace-nowrap">
                      {formatBytes(r.sizeBytes)}
                    </Table.Cell>
                    <Table.Cell className="tabular-nums whitespace-nowrap">
                      {r.viewCount}
                    </Table.Cell>
                    <Table.Cell className="tabular-nums whitespace-nowrap">
                      {formatRelative(r.createdAt)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </DataTable>
            )}
          </Panel>

          <Panel
            title="Workspaces"
            description="Storage in a workspace is charged to its owner."
          >
            <DataTable
              label="Workspaces"
              columns={[
                "Workspace",
                "Role",
                "Owner",
                "Members",
                "Recordings",
                "Screenshots",
                "Stored",
              ]}
            >
              {workspaces.map((w) => (
                <Table.Row key={w.id}>
                  <Table.Cell>
                    <NextLink
                      href={`/workspaces/${w.id}`}
                      className="font-medium hover:underline"
                    >
                      {w.name}
                    </NextLink>
                    <div className="text-fg-subtle text-xs">{w.kind}</div>
                  </Table.Cell>
                  <Table.Cell>
                    <Chip
                      size="sm"
                      color={w.role === "owner" ? "accent" : "default"}
                    >
                      {w.role ?? "—"}
                    </Chip>
                  </Table.Cell>
                  <Table.Cell className="text-fg-muted">
                    {w.owner.id === user.id ? (
                      "This user"
                    ) : (
                      <NextLink
                        href={`/users/${w.owner.id}`}
                        className="hover:underline"
                      >
                        {w.owner.email}
                      </NextLink>
                    )}
                  </Table.Cell>
                  <Table.Cell className="tabular-nums whitespace-nowrap">
                    {w.memberCount}
                    {w.pendingInvites ? ` (+${w.pendingInvites} invited)` : ""}
                  </Table.Cell>
                  <Table.Cell className="tabular-nums whitespace-nowrap">
                    {w.recordingCount}
                  </Table.Cell>
                  <Table.Cell className="tabular-nums whitespace-nowrap">
                    {w.screenshotCount}
                  </Table.Cell>
                  <Table.Cell className="tabular-nums whitespace-nowrap">
                    {formatBytes(w.storageBytes)}
                  </Table.Cell>
                </Table.Row>
              ))}
            </DataTable>
          </Panel>

          <Panel
            title="Subscriptions"
            description="Lemon Squeezy, newest first."
          >
            {subscriptions.length === 0 ? (
              <p className="text-fg-muted text-sm">Never subscribed.</p>
            ) : (
              <DataTable
                label="Subscriptions"
                columns={[
                  "Plan",
                  "Status",
                  "Billing",
                  "Period ends",
                  "Started",
                  "Customer email",
                ]}
              >
                {subscriptions.map((s) => (
                  <Table.Row key={s.id}>
                    <Table.Cell className="font-medium">
                      {s.planLabel}
                    </Table.Cell>
                    <Table.Cell>
                      <Chip
                        size="sm"
                        color={
                          s.status === "past_due"
                            ? "warning"
                            : s.isActive
                              ? "accent"
                              : "default"
                        }
                      >
                        {s.status.replace("_", " ")}
                        {s.isActive ? "" : " · inactive"}
                      </Chip>
                    </Table.Cell>
                    <Table.Cell>{s.cycle}</Table.Cell>
                    <Table.Cell className="tabular-nums whitespace-nowrap">
                      {s.currentPeriodEnd
                        ? formatDate(s.currentPeriodEnd * 1000).slice(0, 10)
                        : "—"}
                    </Table.Cell>
                    <Table.Cell className="tabular-nums whitespace-nowrap">
                      {formatDate(s.createdAt * 1000).slice(0, 10)}
                    </Table.Cell>
                    <Table.Cell className="text-fg-muted">
                      {s.customerEmail}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </DataTable>
            )}
          </Panel>
        </div>

        <aside className="flex flex-col gap-6 xl:sticky xl:top-8 xl:self-start">
          <Panel
            title="Plan"
            description="A granted plan works like a paid one (same storage, no retention sweep) without a subscription. With both, the larger applies."
          >
            {quota.grant && (
              <p className="bg-tint rounded-lg px-3 py-2 text-sm">
                Granted {grantSummary(quota.grant, now)}
              </p>
            )}
            {canWrite ? (
              <GrantForm
                userId={user.id}
                grant={quota.grant}
                plans={STORAGE_PLANS}
              />
            ) : (
              <p className="text-fg-muted text-sm">
                Read-only: your role cannot change plans.
              </p>
            )}
          </Panel>

          <Panel
            title="Storage"
            description={
              <>
                Counts ready recordings, webcam streams and screenshots in every
                workspace this user owns.
                {quota.updatedAt
                  ? ` Last changed ${formatDate(quota.updatedAt)}.`
                  : ""}
              </>
            }
          >
            <StorageMeter used={storage.usedBytes} limit={storage.limitBytes} />
            {canWrite ? (
              <QuotaForm userId={user.id} quota={quota} />
            ) : (
              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className="text-fg-muted text-xs">Storage override</dt>
                  <dd className="tabular-nums">
                    {quota.storageBytesOverride === null
                      ? "—"
                      : formatBytes(quota.storageBytesOverride)}
                  </dd>
                </div>
                <div>
                  <dt className="text-fg-muted text-xs">Note</dt>
                  <dd>{quota.note ?? "—"}</dd>
                </div>
              </dl>
            )}
          </Panel>

          {canWrite && (
            <Panel
              title="Access"
              description="Ends every browser session and revokes the desktop app and extension tokens. The user can sign straight back in."
            >
              <SignOutEverywhere
                userId={user.id}
                sessions={user.activeSessions}
                devices={user.activeDevices}
              />
            </Panel>
          )}

          <Panel title="Admin history">
            {audit.length === 0 ? (
              <p className="text-fg-muted text-sm">No admin changes yet.</p>
            ) : (
              <ol className="flex flex-col gap-3">
                {audit.map((a) => (
                  <li key={a.id} className="border-line border-l-2 pl-3">
                    <div className="text-sm font-medium">{a.action}</div>
                    {a.detail && (
                      <div className="text-fg-muted text-xs break-all">
                        {a.detail}
                      </div>
                    )}
                    <div className="text-fg-subtle text-xs">
                      {a.actor} · {formatRelative(a.createdAt)}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </aside>
      </div>
    </div>
  );
}
