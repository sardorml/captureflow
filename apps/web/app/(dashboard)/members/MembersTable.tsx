"use client";

import { useMemo, useState, useTransition } from "react";
import {
  WORKSPACE_ROLES,
  type AssignableRole,
  type WorkspaceInviteRow,
  type WorkspaceMember,
  type WorkspaceRole,
} from "@captureflow/quota";
import { LogOut, Search, UserPlus, X } from "lucide-react";
import {
  Avatar,
  Button,
  Chip,
  Input,
  InputGroup,
  ListBox,
  Select,
  Table,
} from "@heroui/react";
import { initials } from "@/lib/format";
import { ASSIGNABLE_ROLES, ROLE_LABEL } from "@/lib/workspace/labels";
import { InviteModal } from "../InviteModal";
import {
  changeMemberRoleAction,
  leaveWorkspaceAction,
  removeMemberAction,
  revokeInviteAction,
} from "./actions";

type RoleFilter = "all" | WorkspaceRole;
type StatusFilter = "all" | "active" | "invited";

const ROLE_OPTIONS: { id: RoleFilter; label: string }[] = [
  { id: "all", label: "All roles" },
  ...WORKSPACE_ROLES.map((role) => ({ id: role, label: ROLE_LABEL[role] })),
];

const STATUS_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Everyone" },
  { id: "active", label: "Active" },
  { id: "invited", label: "Invited" },
];

type Row = {
  key: string;
  name: string;
  email: string;
  image: string | null;
  role: WorkspaceRole | null;
  addedAt: number;
  status: "active" | "invited";
  action: "remove" | "leave" | "revoke" | null;
  actionId: string;
  // The owner may move anyone but themselves between member and viewer.
  roleEditable: boolean;
};

function formatAdded(ms: number): string {
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function MembersTable({
  members,
  invites,
  viewerUserId,
  viewerIsOwner,
  workspaceName,
}: {
  members: WorkspaceMember[];
  invites: WorkspaceInviteRow[];
  viewerUserId: string;
  viewerIsOwner: boolean;
  workspaceName: string;
}) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const rows = useMemo<Row[]>(
    () => [
      ...members.map((m) => ({
        key: m.user_id,
        name: m.name,
        email: m.email,
        image: m.image,
        role: m.role,
        addedAt: m.joined_at,
        status: "active" as const,
        action:
          viewerIsOwner && m.role !== "owner"
            ? ("remove" as const)
            : !viewerIsOwner && m.user_id === viewerUserId
              ? ("leave" as const)
              : null,
        actionId: m.user_id,
        roleEditable: viewerIsOwner && m.role !== "owner",
      })),
      ...invites.map((i) => ({
        key: `invite-${i.id}`,
        name: "",
        email: i.email,
        image: null,
        role: i.role as WorkspaceRole,
        addedAt: i.created_at,
        status: "invited" as const,
        action: viewerIsOwner ? ("revoke" as const) : null,
        actionId: i.id,
        roleEditable: false,
      })),
    ],
    [members, invites, viewerIsOwner, viewerUserId],
  );

  const needle = query.trim().toLowerCase();
  const shown = rows.filter(
    (r) =>
      (role === "all" || r.role === role) &&
      (status === "all" || r.status === status) &&
      (needle === "" ||
        r.name.toLowerCase().includes(needle) ||
        r.email.toLowerCase().includes(needle)),
  );

  return (
    <section className="rounded-2xl bg-panel ring-1 ring-line">
      <div className="px-6 pt-6 pb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-fg-strong">
          People{" "}
          <span className="text-lg font-normal text-fg-muted">
            ({members.length})
          </span>
        </h2>
        <p className="mt-1 text-base text-fg-muted">
          Members record here; viewers watch and comment.
          {viewerIsOwner && " Admins can invite, remove and change roles."}
        </p>
      </div>
      <div className="flex flex-col gap-4 border-t border-line px-6 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <InputGroup className="w-full sm:w-72">
            <InputGroup.Prefix>
              <Search size={16} />
            </InputGroup.Prefix>
            <InputGroup.Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or email address"
              aria-label="Search members"
            />
          </InputGroup>
          <FilterSelect
            label="Role"
            value={role}
            options={ROLE_OPTIONS}
            onChange={setRole}
          />
          {invites.length > 0 && (
            <FilterSelect
              label="Status"
              value={status}
              options={STATUS_OPTIONS}
              onChange={setStatus}
            />
          )}
          {viewerIsOwner && (
            <div className="ml-auto">
              <InviteModal
                workspaceName={workspaceName}
                trigger={
                  <Button variant="primary">
                    <UserPlus size={16} />
                    Invite teammates
                  </Button>
                }
              />
            </div>
          )}
        </div>

        <Table variant="secondary">
          <Table.ScrollContainer>
            <Table.Content aria-label="Members" className="w-full">
              <Table.Header className="[&_th]:bg-panel-2 [&_th]:px-3 [&_th]:text-left [&_th]:text-fg-muted [&_th]:after:hidden [&_th:first-child]:rounded-l-lg [&_th:last-child]:rounded-r-lg">
                <Table.Column isRowHeader>Name</Table.Column>
                <Table.Column>Role</Table.Column>
                <Table.Column>Date added</Table.Column>
                <Table.Column>Email address</Table.Column>
                <Table.Column>Status</Table.Column>
                <Table.Column aria-label="Actions"> </Table.Column>
              </Table.Header>
              <Table.Body className="[&_td]:border-line [&_td]:px-3 [&_td]:py-3">
                {shown.map((r) => (
                  <Table.Row key={r.key}>
                    <Table.Cell>
                      <span className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          {r.image && (
                            <Avatar.Image src={r.image} alt={r.name} />
                          )}
                          <Avatar.Fallback className="text-xs">
                            {initials(r.name || r.email)}
                          </Avatar.Fallback>
                        </Avatar>
                        <span className="truncate font-medium text-fg-strong">
                          {r.name || r.email.split("@")[0]}
                        </span>
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-fg-muted">
                      {r.roleEditable && r.role && r.role !== "owner" ? (
                        <RoleSelect userId={r.actionId} role={r.role} />
                      ) : r.role ? (
                        ROLE_LABEL[r.role]
                      ) : (
                        "—"
                      )}
                    </Table.Cell>
                    <Table.Cell
                      className="whitespace-nowrap text-fg-muted"
                      suppressHydrationWarning
                    >
                      {formatAdded(r.addedAt)}
                    </Table.Cell>
                    <Table.Cell className="text-fg-muted">{r.email}</Table.Cell>
                    <Table.Cell>
                      <Chip
                        size="sm"
                        variant="soft"
                        color={r.status === "active" ? "success" : "default"}
                      >
                        {r.status === "active" ? "Active" : "Invited"}
                      </Chip>
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <RowAction row={r} />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
        {shown.length === 0 && (
          <p className="py-6 text-center text-sm text-fg-muted">
            Nobody matches these filters.
          </p>
        )}
      </div>
    </section>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <Select
      selectedKey={value}
      onSelectionChange={(next) => onChange(next as T)}
      aria-label={label}
    >
      <Select.Trigger className="min-w-36">
        <Select.Value />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map((o) => (
            <ListBox.Item key={o.id} id={o.id} textValue={o.label}>
              {o.label}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

// Submits on change: the owner picks a role and the row updates in place.
function RoleSelect({
  userId,
  role,
}: {
  userId: string;
  role: AssignableRole;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Select
      selectedKey={role}
      isDisabled={pending}
      onSelectionChange={(next) => {
        if (next === role) return;
        const fd = new FormData();
        fd.set("userId", userId);
        fd.set("role", String(next));
        startTransition(() => changeMemberRoleAction(fd));
      }}
      aria-label="Role"
    >
      <Select.Trigger className="h-8 min-w-28">
        {/* The trigger shows the role alone; the hint is for the list. */}
        <Select.Value>{({ selectedText }) => selectedText}</Select.Value>
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {ASSIGNABLE_ROLES.map((o) => (
            <ListBox.Item key={o.id} id={o.id} textValue={o.label}>
              {o.label}
              <span className="block text-xs text-fg-muted">{o.hint}</span>
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

function RowAction({ row }: { row: Row }) {
  switch (row.action) {
    case "remove":
      return (
        <form action={removeMemberAction} className="inline-flex">
          <input type="hidden" name="userId" value={row.actionId} />
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            type="submit"
            aria-label={`Remove ${row.name || row.email} from workspace`}
            className="text-danger"
          >
            <X size={16} />
          </Button>
        </form>
      );
    case "leave":
      return (
        <form action={leaveWorkspaceAction} className="inline-flex">
          <Button variant="secondary" size="sm" type="submit">
            <LogOut size={14} />
            Leave
          </Button>
        </form>
      );
    case "revoke":
      return (
        <form action={revokeInviteAction} className="inline-flex">
          <input type="hidden" name="inviteId" value={row.actionId} />
          <Button
            variant="ghost"
            size="sm"
            type="submit"
            className="text-danger"
          >
            Revoke
          </Button>
        </form>
      );
    default:
      return null;
  }
}
