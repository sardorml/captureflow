import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Table } from "@heroui/react";
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
  Empty,
  FormCard,
  Monogram,
  Notice,
  PageHeader,
  PlanChip,
  Stat,
  StatGrid,
  StorageMeter,
  Tone,
  formatBytes,
  formatDate,
  formatDuration,
  formatRelative,
} from "../../_ui";
import { PanelTabs } from "../../_filters";
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

  const recentTable =
    activity.recent.length === 0 ? (
      <Empty title="No recordings yet" />
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
              <div className="text-fg-strong max-w-xs truncate font-medium">
                {r.title || "Untitled"}
              </div>
              <div className="text-fg-subtle text-xs">
                <span className="font-mono">{r.slug}</span>
                {r.workspaceName ? ` · ${r.workspaceName}` : ""}
              </div>
            </Table.Cell>
            <Table.Cell>
              <Tone
                color={
                  STATE_COLOR[r.state as keyof typeof STATE_COLOR] ?? "default"
                }
              >
                {r.state}
              </Tone>
            </Table.Cell>
            <Table.Cell className="text-fg-muted capitalize">
              {r.visibility}
            </Table.Cell>
            <Table.Cell className="tabular-nums whitespace-nowrap">
              {r.durationMs ? formatDuration(r.durationMs) : "—"}
            </Table.Cell>
            <Table.Cell className="tabular-nums whitespace-nowrap">
              {formatBytes(r.sizeBytes)}
            </Table.Cell>
            <Table.Cell className="tabular-nums">{r.viewCount}</Table.Cell>
            <Table.Cell className="text-fg-muted whitespace-nowrap">
              {formatRelative(r.createdAt)}
            </Table.Cell>
          </Table.Row>
        ))}
      </DataTable>
    );

  const workspaceTable = (
    <DataTable
      label="Workspaces"
      columns={[
        "Workspace",
        "Role",
        "Owner",
        "Members",
        "Recordings",
        "Stored",
      ]}
    >
      {workspaces.map((w) => (
        <Table.Row key={w.id}>
          <Table.Cell>
            <div className="flex items-center gap-3">
              <Monogram name={w.name} />
              <div className="min-w-0">
                <NextLink
                  href={`/workspaces/${w.id}`}
                  className="text-fg-strong truncate font-medium hover:underline"
                >
                  {w.name}
                </NextLink>
                <div className="text-fg-subtle text-xs capitalize">
                  {w.kind}
                </div>
              </div>
            </div>
          </Table.Cell>
          <Table.Cell>
            <Tone color={w.role === "owner" ? "accent" : "default"}>
              {w.role ?? "—"}
            </Tone>
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
            {w.pendingInvites ? (
              <span className="text-fg-subtle">
                {" "}
                +{w.pendingInvites} invited
              </span>
            ) : null}
          </Table.Cell>
          <Table.Cell className="tabular-nums">{w.recordingCount}</Table.Cell>
          <Table.Cell className="tabular-nums whitespace-nowrap">
            {formatBytes(w.storageBytes)}
          </Table.Cell>
        </Table.Row>
      ))}
    </DataTable>
  );

  const subscriptionTable =
    subscriptions.length === 0 ? (
      <Empty title="Never subscribed" />
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
            <Table.Cell className="text-fg-strong font-medium">
              {s.planLabel}
            </Table.Cell>
            <Table.Cell>
              <Tone
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
              </Tone>
            </Table.Cell>
            <Table.Cell className="capitalize">{s.cycle}</Table.Cell>
            <Table.Cell className="tabular-nums whitespace-nowrap">
              {s.currentPeriodEnd
                ? formatDate(s.currentPeriodEnd * 1000).slice(0, 10)
                : "—"}
            </Table.Cell>
            <Table.Cell className="tabular-nums whitespace-nowrap">
              {formatDate(s.createdAt * 1000).slice(0, 10)}
            </Table.Cell>
            <Table.Cell className="text-fg-muted">{s.customerEmail}</Table.Cell>
          </Table.Row>
        ))}
      </DataTable>
    );

  const planPanel = (
    <div className="grid gap-5 lg:grid-cols-2">
      <FormCard
        title="Plan"
        description="A granted plan works like a paid one (same storage, no retention sweep) without a subscription. With both, the larger applies."
      >
        {quota.grant && (
          <Notice>Granted {grantSummary(quota.grant, now)}</Notice>
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
      </FormCard>
      <FormCard
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
      </FormCard>
      <FormCard
        title="Access"
        description={`${user.activeSessions} browser ${user.activeSessions === 1 ? "session" : "sessions"} and ${user.activeDevices} connected ${user.activeDevices === 1 ? "device" : "devices"} (desktop app and extension). Signing out ends all of them; the user can sign straight back in.`}
      >
        {canWrite ? (
          <SignOutEverywhere
            userId={user.id}
            sessions={user.activeSessions}
            devices={user.activeDevices}
          />
        ) : (
          <p className="text-fg-muted text-sm">
            Read-only: your role cannot sign users out.
          </p>
        )}
      </FormCard>
    </div>
  );

  const historyTable =
    audit.length === 0 ? (
      <Empty title="No admin changes yet" />
    ) : (
      <DataTable
        label="Admin history"
        columns={["Action", "Detail", "By", "When"]}
      >
        {audit.map((a) => (
          <Table.Row key={a.id}>
            <Table.Cell>
              <Tone color="default">{a.action}</Tone>
            </Table.Cell>
            <Table.Cell className="text-fg-muted max-w-sm truncate">
              {a.detail ?? "—"}
            </Table.Cell>
            <Table.Cell className="text-fg-muted">{a.actor}</Table.Cell>
            <Table.Cell className="text-fg-muted whitespace-nowrap">
              {formatRelative(a.createdAt)}
            </Table.Cell>
          </Table.Row>
        ))}
      </DataTable>
    );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={user.name || user.email}
        back={{ href: "/users", label: "Users" }}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {user.name && <span>{user.email}</span>}
            <span>Joined {formatRelative(user.createdAt)}</span>
            <span>Active {formatRelative(user.lastActiveAt)}</span>
          </span>
        }
        actions={
          <>
            <PlanChip plan={user.plan} />
            <Tone color={user.emailVerified ? "success" : "warning"}>
              {user.emailVerified ? "Verified" : "Unverified"}
            </Tone>
            {user.providers.map((p) => (
              <Tone key={p} color="default">
                {p === "credential" ? "password" : p}
              </Tone>
            ))}
          </>
        }
      >
        <Monogram name={user.name || user.email} size="lg" />
      </PageHeader>

      <StatGrid columns={4}>
        <Stat
          label="Recordings"
          value={user.recordingCount.toLocaleString()}
          hint={`${activity.recordings30d} in 30 days · ${formatDuration(activity.totalDurationMs)} total`}
        />
        <Stat
          label="Screenshots"
          value={user.screenshotCount.toLocaleString()}
          hint={`${activity.screenshots30d} in 30 days`}
        />
        <Stat
          label="Views received"
          value={activity.totalViews.toLocaleString()}
          hint="Recordings and screenshots"
        />
        <Stat
          label="Stored"
          value={formatBytes(storage.usedBytes)}
          hint={`of ${formatBytes(storage.limitBytes)} · ${ownedTeams} team ${ownedTeams === 1 ? "workspace" : "workspaces"} owned`}
        />
      </StatGrid>

      <PanelTabs
        label="User details"
        items={[
          { id: "recordings", label: "Recordings", content: recentTable },
          {
            id: "workspaces",
            label: `Workspaces · ${workspaces.length}`,
            content: workspaceTable,
          },
          { id: "plan", label: "Plan & access", content: planPanel },
          {
            id: "subscriptions",
            label: "Subscriptions",
            content: subscriptionTable,
          },
          { id: "history", label: "History", content: historyTable },
        ]}
      />
    </div>
  );
}
