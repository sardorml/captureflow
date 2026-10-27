import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Table } from "@heroui/react";
import {
  getAdminWorkspace,
  listWorkspaceInvites,
  listWorkspaceMembers,
} from "@captureflow/admin";
import { getSeatPlan } from "@captureflow/admin";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import {
  DataTable,
  Empty,
  Monogram,
  PageHeader,
  PersonCell,
  Stat,
  StatGrid,
  Tone,
  formatBytes,
  formatDate,
  formatRelative,
} from "../../_ui";
import { PanelTabs } from "../../_filters";

const INVITE_COLOR = {
  pending: "accent",
  accepted: "success",
  expired: "default",
} as const;

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("users.read");
  const { id } = await params;
  const env = await getAdminEnv();
  if (!env?.DB) notFound();

  const [workspace, members, invites] = await Promise.all([
    getAdminWorkspace(env.DB, id),
    listWorkspaceMembers(env.DB, id),
    listWorkspaceInvites(env.DB, id),
  ]);
  if (!workspace) notFound();

  const membersTable = (
    <DataTable
      label="Members"
      columns={[
        "Member",
        "Role",
        "Recordings",
        "Screenshots",
        "Uploaded",
        "Last active",
        "Joined",
      ]}
    >
      {members.map((m) => (
        <Table.Row key={m.userId}>
          <Table.Cell>
            <PersonCell id={m.userId} name={m.name} email={m.email} />
          </Table.Cell>
          <Table.Cell>
            <Tone color={m.role === "owner" ? "accent" : "default"}>
              {m.role}
            </Tone>
          </Table.Cell>
          <Table.Cell className="tabular-nums">{m.recordingCount}</Table.Cell>
          <Table.Cell className="tabular-nums">{m.screenshotCount}</Table.Cell>
          <Table.Cell className="tabular-nums whitespace-nowrap">
            {formatBytes(m.storageBytes)}
          </Table.Cell>
          <Table.Cell className="text-fg-muted whitespace-nowrap">
            {formatRelative(m.lastActiveAt)}
          </Table.Cell>
          <Table.Cell className="text-fg-muted whitespace-nowrap">
            {formatRelative(m.joinedAt)}
          </Table.Cell>
        </Table.Row>
      ))}
    </DataTable>
  );

  const invitesTable =
    invites.length === 0 ? (
      <Empty title="No invites sent" />
    ) : (
      <DataTable
        label="Invites"
        columns={["Email", "Status", "Invited by", "Sent", "Expires"]}
      >
        {invites.map((i) => (
          <Table.Row key={i.id}>
            <Table.Cell className="text-fg-strong font-medium">
              {i.email}
            </Table.Cell>
            <Table.Cell>
              <Tone color={INVITE_COLOR[i.status]}>{i.status}</Tone>
            </Table.Cell>
            <Table.Cell className="text-fg-muted">
              {i.invitedBy ?? "—"}
            </Table.Cell>
            <Table.Cell className="text-fg-muted whitespace-nowrap">
              {formatRelative(i.createdAt)}
            </Table.Cell>
            <Table.Cell className="text-fg-muted whitespace-nowrap">
              {i.status === "accepted"
                ? `Accepted ${formatRelative(i.acceptedAt)}`
                : formatDate(i.expiresAt).slice(0, 10)}
            </Table.Cell>
          </Table.Row>
        ))}
      </DataTable>
    );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={workspace.name}
        back={{ href: "/workspaces", label: "Workspaces" }}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Created {formatRelative(workspace.createdAt)}</span>
            <span>
              Owner{" "}
              <NextLink
                href={`/users/${workspace.owner.id}`}
                className="text-fg hover:underline"
              >
                {workspace.owner.name || workspace.owner.email}
              </NextLink>
            </span>
            <span className="font-mono text-xs">{workspace.slug}</span>
          </span>
        }
        actions={
          <>
            <Tone color={workspace.kind === "team" ? "accent" : "default"}>
              {workspace.kind}
            </Tone>
            <Tone
              color={
                workspace.plan.status === "past_due"
                  ? "warning"
                  : workspace.plan.tier === "team"
                    ? "accent"
                    : "default"
              }
            >
              {workspace.plan.tier === "team"
                ? `${workspace.plan.plan ? getSeatPlan(workspace.plan.plan).name : "Paid"} · ${workspace.plan.seats} ${workspace.plan.seats === 1 ? "seat" : "seats"}`
                : "Free"}
              {workspace.plan.status && workspace.plan.status !== "active"
                ? ` · ${workspace.plan.status.replace("_", " ")}`
                : ""}
            </Tone>
          </>
        }
      >
        <Monogram name={workspace.name} size="lg" />
      </PageHeader>

      <StatGrid columns={4}>
        <Stat
          label="Members"
          value={String(workspace.memberCount)}
          hint={`${workspace.pendingInvites} pending ${workspace.pendingInvites === 1 ? "invite" : "invites"}`}
        />
        <Stat
          label="Recordings"
          value={String(workspace.recordingCount)}
          hint={`${workspace.screenshotCount} screenshots`}
        />
        <Stat
          label="Stored"
          value={formatBytes(workspace.storageBytes)}
          hint={
            workspace.plan.tier === "team"
              ? "Pooled across the plan's seats"
              : "Free plan: capped per recording"
          }
        />
        <Stat
          label="Sharing"
          value={
            workspace.allowPublicLinks ? "Public links on" : "Public links off"
          }
          hint={
            workspace.allowMemberUploads
              ? "Members can upload here"
              : "Member uploads go to personal"
          }
        />
      </StatGrid>

      <PanelTabs
        label="Workspace details"
        items={[
          {
            id: "members",
            label: `Members · ${members.length}`,
            content: membersTable,
          },
          {
            id: "invites",
            label: `Invites · ${invites.length}`,
            content: invitesTable,
          },
        ]}
      />
    </div>
  );
}
