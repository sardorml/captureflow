import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Chip, Table } from "@heroui/react";
import {
  getAdminWorkspace,
  listWorkspaceInvites,
  listWorkspaceMembers,
} from "@captureflow/admin";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import {
  DataTable,
  Initials,
  Panel,
  PersonCell,
  Stat,
  formatBytes,
  formatDate,
  formatRelative,
} from "../../_ui";

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

  return (
    <div className="flex flex-col gap-6">
      <NextLink
        href="/workspaces"
        className="text-fg-muted w-fit text-sm hover:underline"
      >
        ← Workspaces
      </NextLink>

      <header className="border-line bg-panel flex flex-wrap items-center gap-5 rounded-xl border p-5">
        <Initials name={workspace.name} size="lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-fg-strong truncate text-xl font-semibold">
              {workspace.name}
            </h1>
            <Chip size="sm" variant="secondary">
              {workspace.kind}
            </Chip>
          </div>
          <div className="text-fg-subtle flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span>Created {formatDate(workspace.createdAt)}</span>
            <span>
              Slug <span className="font-mono">{workspace.slug}</span>
            </span>
            <span className="font-mono">{workspace.id}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-fg-subtle text-xs">Owner</span>
          <PersonCell
            id={workspace.owner.id}
            name={workspace.owner.name}
            email={workspace.owner.email}
          />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 2xl:grid-cols-7">
        <Stat label="Members" value={String(workspace.memberCount)} />
        <Stat
          label="Pending invites"
          value={String(workspace.pendingInvites)}
        />
        <Stat label="Recordings" value={String(workspace.recordingCount)} />
        <Stat label="Screenshots" value={String(workspace.screenshotCount)} />
        <Stat
          label="Stored"
          value={formatBytes(workspace.storageBytes)}
          hint="Charged to the owner"
        />
        <Stat
          label="Public links"
          value={workspace.allowPublicLinks ? "Allowed" : "Off"}
          hint="Off coerces public uploads to workspace"
        />
        <Stat
          label="Member uploads"
          value={workspace.allowMemberUploads ? "Allowed" : "Off"}
          hint="Off sends uploads to personal"
        />
      </div>

      <Panel
        title="Members"
        description="Storage here is charged to the owner's plan, whoever uploaded it."
      >
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
                <Chip
                  size="sm"
                  color={m.role === "owner" ? "accent" : "default"}
                >
                  {m.role}
                </Chip>
              </Table.Cell>
              <Table.Cell className="tabular-nums whitespace-nowrap">
                {m.recordingCount}
              </Table.Cell>
              <Table.Cell className="tabular-nums whitespace-nowrap">
                {m.screenshotCount}
              </Table.Cell>
              <Table.Cell className="tabular-nums whitespace-nowrap">
                {formatBytes(m.storageBytes)}
              </Table.Cell>
              <Table.Cell className="tabular-nums whitespace-nowrap">
                {formatRelative(m.lastActiveAt)}
              </Table.Cell>
              <Table.Cell className="tabular-nums whitespace-nowrap">
                {formatDate(m.joinedAt).slice(0, 10)}
              </Table.Cell>
            </Table.Row>
          ))}
        </DataTable>
      </Panel>

      <Panel title="Invites">
        {invites.length === 0 ? (
          <p className="text-fg-muted text-sm">No invites sent.</p>
        ) : (
          <DataTable
            label="Invites"
            columns={["Email", "Status", "Invited by", "Sent", "Expires"]}
          >
            {invites.map((i) => (
              <Table.Row key={i.id}>
                <Table.Cell className="font-medium">{i.email}</Table.Cell>
                <Table.Cell>
                  <Chip size="sm" color={INVITE_COLOR[i.status]}>
                    {i.status}
                  </Chip>
                </Table.Cell>
                <Table.Cell className="text-fg-muted">
                  {i.invitedBy ?? "—"}
                </Table.Cell>
                <Table.Cell className="tabular-nums whitespace-nowrap">
                  {formatDate(i.createdAt)}
                </Table.Cell>
                <Table.Cell className="tabular-nums whitespace-nowrap">
                  {i.status === "accepted"
                    ? `accepted ${formatDate(i.acceptedAt)}`
                    : formatDate(i.expiresAt)}
                </Table.Cell>
              </Table.Row>
            ))}
          </DataTable>
        )}
      </Panel>
    </div>
  );
}
