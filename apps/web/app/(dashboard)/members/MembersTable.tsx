"use client";

import { useMemo, useState, useTransition } from "react";
import {
  WORKSPACE_ROLES,
  getSeatPlan,
  seatPriceUsd,
  type AssignableRole,
  type SeatRequest,
  type WorkspaceInviteRow,
  type WorkspaceMember,
  type WorkspaceRole,
} from "@captureflow/quota";
import { LogOut, Search, UserPlus, X } from "lucide-react";
import {
  AlertDialog,
  Avatar,
  Button,
  Chip,
  Input,
  InputGroup,
  ListBox,
  Select,
  Table,
} from "@heroui/react";
import type { PaidSeats } from "@/lib/billing/seat-checkout";
import { initials } from "@/lib/format";
import { ASSIGNABLE_ROLES, ROLE_LABEL } from "@/lib/workspace/labels";
import { InviteModal } from "../InviteModal";
import {
  changeMemberRoleAction,
  denySeatRequestAction,
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
  downgradeAt: number | null;
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
  paidSeats,
  seatRequests,
}: {
  members: WorkspaceMember[];
  invites: WorkspaceInviteRow[];
  viewerUserId: string;
  viewerIsOwner: boolean;
  workspaceName: string;
  paidSeats: PaidSeats | null;
  seatRequests: SeatRequest[];
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
        downgradeAt: m.downgrade_at,
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
        downgradeAt: null,
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
      {viewerIsOwner && seatRequests.length > 0 && (
        <SeatRequests requests={seatRequests} paidSeats={paidSeats} />
      )}
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
                paidSeats={paidSeats}
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
                        <RoleSelect
                          userId={r.actionId}
                          name={r.name || r.email}
                          role={r.role}
                          downgradeAt={r.downgradeAt}
                          paidSeats={paidSeats}
                        />
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
                      <RowAction
                        row={r}
                        workspaceName={workspaceName}
                        paidSeats={paidSeats}
                      />
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

function submitRole(userId: string, role: AssignableRole) {
  const fd = new FormData();
  fd.set("userId", userId);
  fd.set("role", role);
  return changeMemberRoleAction(fd);
}

type SeatChange = "add" | "remove";

/*
 * Submits on change, except that a paid workspace confirms either way first:
 * a new member adds a seat now, and a member moved to viewer keeps the paid
 * seat until the period ends.
 */
function RoleSelect({
  userId,
  name,
  role,
  downgradeAt,
  paidSeats,
}: {
  userId: string;
  name: string;
  role: AssignableRole;
  downgradeAt: number | null;
  paidSeats: PaidSeats | null;
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState<SeatChange | null>(null);
  const submit = (next: AssignableRole) =>
    startTransition(() => submitRole(userId, next));
  return (
    <div className="flex flex-col items-start gap-1">
      <Select
        selectedKey={role}
        isDisabled={pending}
        onSelectionChange={(next) => {
          if (next === role) return;
          if (paidSeats && next === "member") return setConfirming("add");
          if (paidSeats?.periodEnd && next === "viewer") {
            return setConfirming("remove");
          }
          submit(next as AssignableRole);
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
      {downgradeAt !== null && (
        <span className="text-xs text-fg-muted" suppressHydrationWarning>
          Viewer from {formatAdded(downgradeAt)} ·{" "}
          <button
            type="button"
            disabled={pending}
            onClick={() => submit("member")}
            className="cursor-pointer text-accent hover:underline"
          >
            Keep as member
          </button>
        </span>
      )}
      {paidSeats && confirming ? (
        <SeatConfirm
          change={confirming}
          name={name}
          paidSeats={paidSeats}
          isOpen
          onOpenChange={(open) => !open && setConfirming(null)}
          onConfirm={() => submit(confirming === "add" ? "member" : "viewer")}
        />
      ) : null}
    </div>
  );
}

function SeatRequests({
  requests,
  paidSeats,
}: {
  requests: SeatRequest[];
  paidSeats: PaidSeats | null;
}) {
  return (
    <div className="border-t border-line px-6 py-5">
      <h3 className="text-base font-semibold text-fg-strong">
        Seat requests{" "}
        <span className="font-normal text-fg-muted">({requests.length})</span>
      </h3>
      <p className="mt-1 text-sm text-fg-muted">
        These viewers asked to record. Approving makes them a member
        {paidSeats ? ", which adds a paid seat" : ""}.
      </p>
      <ul className="mt-3 flex flex-col divide-y divide-line rounded-xl ring-1 ring-line">
        {requests.map((r) => (
          <SeatRequestRow key={r.user_id} request={r} paidSeats={paidSeats} />
        ))}
      </ul>
    </div>
  );
}

function SeatRequestRow({
  request,
  paidSeats,
}: {
  request: SeatRequest;
  paidSeats: PaidSeats | null;
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const name = request.name || request.email.split("@")[0];
  const approve = () =>
    startTransition(() => submitRole(request.user_id, "member"));
  const deny = () =>
    startTransition(() => {
      const fd = new FormData();
      fd.set("userId", request.user_id);
      return denySeatRequestAction(fd);
    });
  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      <Avatar className="h-8 w-8 shrink-0">
        {request.image && <Avatar.Image src={request.image} alt={name} />}
        <Avatar.Fallback className="text-xs">
          {initials(request.name || request.email)}
        </Avatar.Fallback>
      </Avatar>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium text-fg-strong">{name}</span>
        <span
          className="truncate text-xs text-fg-muted"
          suppressHydrationWarning
        >
          {request.email} · asked {formatAdded(request.created_at)}
        </span>
      </span>
      <Button variant="secondary" size="sm" isDisabled={pending} onPress={deny}>
        Deny
      </Button>
      <Button
        size="sm"
        isDisabled={pending}
        onPress={() => (paidSeats ? setConfirming(true) : approve())}
      >
        Approve
      </Button>
      {paidSeats && (
        <SeatConfirm
          change="add"
          name={name}
          paidSeats={paidSeats}
          isOpen={confirming}
          onOpenChange={setConfirming}
          onConfirm={approve}
        />
      )}
    </li>
  );
}

function SeatConfirm({
  change,
  name,
  paidSeats,
  isOpen,
  onOpenChange,
  onConfirm,
}: {
  change: SeatChange;
  name: string;
  paidSeats: PaidSeats;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const { plan, cycle, seats, periodEnd } = paidSeats;
  const adding = change === "add";
  const nextSeats = adding ? seats + 1 : Math.max(1, seats - 1);
  const before = seatPriceUsd(seats, cycle, plan);
  const after = seatPriceUsd(nextSeats, cycle, plan);
  const planLine = `Your ${getSeatPlan(plan).name} plan goes from ${seats} to ${nextSeats} seats, $${before} to $${after} a month${cycle === "annual" ? ", billed yearly" : ""}.`;
  const until = periodEnd ? formatAdded(periodEnd * 1000) : null;
  return (
    <AlertDialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Backdrop>
        <AlertDialog.Container size="sm">
          <AlertDialog.Dialog>
            <AlertDialog.Header>
              <AlertDialog.Heading>
                {adding
                  ? `Give ${name} a paid seat?`
                  : `Move ${name} to viewer?`}
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body className="flex flex-col gap-2 text-sm text-fg">
              {adding ? (
                <>
                  <p>Members record, so each one is a paid seat. {planLine}</p>
                  <p className="text-fg-muted">
                    The rest of this billing period is added to your next
                    invoice.
                  </p>
                </>
              ) : (
                <>
                  <p suppressHydrationWarning>
                    {name} keeps recording until {until}, the end of the period
                    you&apos;ve paid for. Then they become a viewer, who can
                    watch and comment but not record.
                  </p>
                  <p className="text-fg-muted">
                    From then, {planLine.charAt(0).toLowerCase()}
                    {planLine.slice(1)}
                  </p>
                </>
              )}
            </AlertDialog.Body>
            <AlertDialog.Footer className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onPress={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onPress={() => {
                  onOpenChange(false);
                  onConfirm();
                }}
              >
                {adding ? "Add paid seat" : "Move to viewer"}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}

function RowAction({
  row,
  workspaceName,
  paidSeats,
}: {
  row: Row;
  workspaceName: string;
  paidSeats: PaidSeats | null;
}) {
  const name = row.name || row.email;
  switch (row.action) {
    case "remove":
      return (
        <ConfirmAction
          trigger={(open) => (
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              onPress={open}
              aria-label={`Remove ${name} from workspace`}
              className="text-danger"
            >
              <X size={16} />
            </Button>
          )}
          heading={`Remove ${name} from ${workspaceName}?`}
          body={[
            "They lose access straight away. Their recordings and screenshots stay in the workspace.",
            ...(paidSeats && row.role === "member"
              ? [
                  `That frees their paid seat: your plan goes from ${paidSeats.seats} to ${Math.max(1, paidSeats.seats - 1)} seats.`,
                ]
              : []),
          ]}
          confirmLabel="Remove"
          onConfirm={() => {
            const form = new FormData();
            form.set("userId", row.actionId);
            return removeMemberAction(form);
          }}
        />
      );
    case "leave":
      return (
        <ConfirmAction
          trigger={(open) => (
            <Button variant="secondary" size="sm" onPress={open}>
              <LogOut size={14} />
              Leave
            </Button>
          )}
          heading={`Leave ${workspaceName}?`}
          body={[
            "You’ll lose access to its recordings and screenshots. Anything you recorded there stays in the workspace.",
            "To come back, someone has to invite you again.",
          ]}
          confirmLabel="Leave workspace"
          onConfirm={leaveWorkspaceAction}
        />
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

function ConfirmAction({
  trigger,
  heading,
  body,
  confirmLabel,
  onConfirm,
}: {
  trigger: (open: () => void) => React.ReactNode;
  heading: string;
  body: string[];
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}) {
  const [isOpen, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  return (
    <>
      {trigger(() => setOpen(true))}
      <AlertDialog isOpen={isOpen} onOpenChange={setOpen}>
        <AlertDialog.Backdrop>
          <AlertDialog.Container size="sm">
            <AlertDialog.Dialog>
              <AlertDialog.Header>
                <AlertDialog.Heading>{heading}</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body className="flex flex-col gap-2 text-sm text-fg">
                {body.map((line, i) => (
                  <p key={line} className={i > 0 ? "text-fg-muted" : undefined}>
                    {line}
                  </p>
                ))}
              </AlertDialog.Body>
              <AlertDialog.Footer className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  isDisabled={pending}
                  onPress={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  isDisabled={pending}
                  onPress={() =>
                    startTransition(async () => {
                      await onConfirm();
                      setOpen(false);
                    })
                  }
                >
                  {confirmLabel}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </>
  );
}
