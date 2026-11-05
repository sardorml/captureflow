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
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppLocale, useAppMessages } from "@/components/app-i18n-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PaidSeats } from "@/lib/billing/seat-checkout";
import { initials } from "@/lib/format";
import { fill } from "@/lib/i18n/fill";
import { fmt } from "@/lib/i18n/format";
import { formatDate } from "@/lib/i18n/intl";
import { assignableRoles } from "@/lib/workspace/labels";
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

// English keeps its day-first form ("5 November 2026").
function useFormatAdded(): (ms: number) => string {
  const { lang } = useAppLocale();
  return (ms) =>
    formatDate(
      ms,
      lang,
      { day: "numeric", month: "long", year: "numeric" },
      "en-GB",
    );
}

export function MembersTable({
  members,
  invites,
  viewerUserId,
  viewerIsOwner,
  canInvite,
  inviteHref,
  workspaceName,
  paidSeats,
  selfHosted,
  seatRequests,
}: {
  members: WorkspaceMember[];
  invites: WorkspaceInviteRow[];
  viewerUserId: string;
  viewerIsOwner: boolean;
  canInvite: boolean;
  // Set for a self-hosted administrator, who invites from the admin area.
  inviteHref: string | null;
  workspaceName: string;
  paidSeats: PaidSeats | null;
  selfHosted: boolean;
  seatRequests: SeatRequest[];
}) {
  const m = useAppMessages().members;
  const formatAdded = useFormatAdded();
  const roleOptions: { id: RoleFilter; label: string }[] = [
    { id: "all", label: m.table.allRoles },
    ...WORKSPACE_ROLES.map((id) => ({ id, label: m.roles[id] })),
  ];
  const statusOptions: { id: StatusFilter; label: string }[] = [
    { id: "all", label: m.table.everyone },
    { id: "active", label: m.statuses.active },
    { id: "invited", label: m.statuses.invited },
  ];
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const rows = useMemo<Row[]>(
    () => [
      ...members.map((member) => ({
        key: member.user_id,
        name: member.name,
        email: member.email,
        image: member.image,
        role: member.role,
        addedAt: member.joined_at,
        status: "active" as const,
        action:
          viewerIsOwner && member.role !== "owner"
            ? ("remove" as const)
            : !viewerIsOwner && member.user_id === viewerUserId
              ? ("leave" as const)
              : null,
        actionId: member.user_id,
        roleEditable: viewerIsOwner && member.role !== "owner",
        downgradeAt: member.downgrade_at,
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
          {m.title}{" "}
          <span className="text-lg font-normal text-fg-muted">
            ({members.length})
          </span>
        </h2>
        <p className="mt-1 text-base text-fg-muted">
          {m.table.intro}
          {viewerIsOwner && ` ${m.table.ownerIntro}`}
        </p>
      </div>
      {viewerIsOwner && seatRequests.length > 0 && (
        <SeatRequests requests={seatRequests} paidSeats={paidSeats} />
      )}
      <div className="flex flex-col gap-4 border-t border-line px-6 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <InputGroup className="w-full sm:w-72">
            <InputGroupAddon>
              <Search size={16} />
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={m.table.searchPlaceholder}
              aria-label={m.table.searchLabel}
            />
          </InputGroup>
          <FilterSelect
            label={m.role}
            value={role}
            options={roleOptions}
            onChange={setRole}
          />
          {invites.length > 0 && (
            <FilterSelect
              label={m.status}
              value={status}
              options={statusOptions}
              onChange={setStatus}
            />
          )}
          {canInvite && (
            <div className="ml-auto">
              {inviteHref ? (
                <Button asChild>
                  <a href={inviteHref}>
                    <UserPlus size={16} />
                    {m.invite.trigger}
                  </a>
                </Button>
              ) : (
                <InviteModal
                  workspaceName={workspaceName}
                  paidSeats={paidSeats}
                  selfHosted={selfHosted}
                  trigger={
                    <Button>
                      <UserPlus size={16} />
                      {m.invite.trigger}
                    </Button>
                  }
                />
              )}
            </div>
          )}
        </div>

        <Table aria-label={m.title} className="w-full">
          <TableHeader className="[&_th]:bg-panel-2 [&_th]:px-3 [&_th]:text-left [&_th]:text-fg-muted [&_th:first-child]:rounded-l-lg [&_th:last-child]:rounded-r-lg [&_tr]:border-0">
            <TableRow>
              <TableHead>{m.table.columns.name}</TableHead>
              <TableHead>{m.role}</TableHead>
              <TableHead>{m.table.columns.dateAdded}</TableHead>
              <TableHead>{m.table.columns.email}</TableHead>
              <TableHead>{m.status}</TableHead>
              <TableHead aria-label={m.table.columns.actions}> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_td]:border-line [&_td]:px-3 [&_td]:py-3">
            {shown.map((r) => (
              <TableRow key={r.key}>
                <TableCell>
                  <span className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      {r.image && <AvatarImage src={r.image} alt={r.name} />}
                      <AvatarFallback className="text-xs">
                        {initials(r.name || r.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate font-medium text-fg-strong">
                      {r.name || r.email.split("@")[0]}
                    </span>
                  </span>
                </TableCell>
                <TableCell className="text-fg-muted">
                  {r.roleEditable && r.role && r.role !== "owner" ? (
                    <RoleSelect
                      userId={r.actionId}
                      name={r.name || r.email}
                      role={r.role}
                      downgradeAt={r.downgradeAt}
                      paidSeats={paidSeats}
                      selfHosted={selfHosted}
                    />
                  ) : r.role ? (
                    m.roles[r.role]
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell
                  className="whitespace-nowrap text-fg-muted"
                  suppressHydrationWarning
                >
                  {formatAdded(r.addedAt)}
                </TableCell>
                <TableCell className="text-fg-muted">{r.email}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      r.status === "active"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : undefined
                    }
                  >
                    {m.statuses[r.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <RowAction
                    row={r}
                    workspaceName={workspaceName}
                    paidSeats={paidSeats}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {shown.length === 0 && (
          <p className="py-6 text-center text-sm text-fg-muted">
            {m.table.empty}
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
    <Select value={value} onValueChange={(next) => onChange(next as T)}>
      <SelectTrigger aria-label={label} className="min-w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id} textValue={o.label}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
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
  selfHosted,
}: {
  userId: string;
  name: string;
  role: AssignableRole;
  downgradeAt: number | null;
  paidSeats: PaidSeats | null;
  selfHosted: boolean;
}) {
  const formatAdded = useFormatAdded();
  const m = useAppMessages().members;
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState<SeatChange | null>(null);
  const submit = (next: AssignableRole) =>
    startTransition(() => submitRole(userId, next));
  return (
    <div className="flex flex-col items-start gap-1">
      <Select
        value={role}
        disabled={pending}
        onValueChange={(next) => {
          if (next === role) return;
          if (paidSeats && next === "member") return setConfirming("add");
          if (paidSeats?.periodEnd && next === "viewer") {
            return setConfirming("remove");
          }
          submit(next as AssignableRole);
        }}
      >
        <SelectTrigger aria-label={m.role} size="sm" className="min-w-28">
          {/* The trigger shows the role alone; the hint is for the list. */}
          <SelectValue>{m.roles[role]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {assignableRoles(selfHosted, m).map((o) => (
            <SelectItem key={o.id} value={o.id} textValue={o.label}>
              <span className="flex flex-col items-start">
                {o.label}
                <span className="block text-xs text-fg-muted">{o.hint}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {downgradeAt !== null && (
        <span className="text-xs text-fg-muted" suppressHydrationWarning>
          {fill(m.table.downgradeNote, {
            date: formatAdded(downgradeAt),
            keep: (
              <button
                type="button"
                disabled={pending}
                onClick={() => submit("member")}
                className="cursor-pointer text-accent-strong hover:underline"
              >
                {m.table.keepAsMember}
              </button>
            ),
          })}
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
  const m = useAppMessages().members.seatRequests;
  return (
    <div className="border-t border-line px-6 py-5">
      <h3 className="text-base font-semibold text-fg-strong">
        {m.title}{" "}
        <span className="font-normal text-fg-muted">({requests.length})</span>
      </h3>
      <p className="mt-1 text-sm text-fg-muted">
        {paidSeats ? m.descriptionPaid : m.description}
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
  const formatAdded = useFormatAdded();
  const m = useAppMessages().members.seatRequests;
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
        {request.image && <AvatarImage src={request.image} alt={name} />}
        <AvatarFallback className="text-xs">
          {initials(request.name || request.email)}
        </AvatarFallback>
      </Avatar>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium text-fg-strong">{name}</span>
        <span
          className="truncate text-xs text-fg-muted"
          suppressHydrationWarning
        >
          {fmt(m.asked, {
            email: request.email,
            date: formatAdded(request.created_at),
          })}
        </span>
      </span>
      <Button variant="secondary" size="sm" disabled={pending} onClick={deny}>
        {m.deny}
      </Button>
      <Button
        size="sm"
        disabled={pending}
        onClick={() => (paidSeats ? setConfirming(true) : approve())}
      >
        {m.approve}
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
  const formatAdded = useFormatAdded();
  const messages = useAppMessages();
  const m = messages.members.seatConfirm;
  const { plan, cycle, seats, periodEnd } = paidSeats;
  const adding = change === "add";
  const nextSeats = adding ? seats + 1 : Math.max(1, seats - 1);
  const yearly = cycle === "annual";
  const planChange = {
    plan: getSeatPlan(plan).name,
    seats,
    nextSeats,
    before: seatPriceUsd(seats, cycle, plan),
    after: seatPriceUsd(nextSeats, cycle, plan),
  };
  const until = periodEnd ? formatAdded(periodEnd * 1000) : null;
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {fmt(adding ? m.addTitle : m.removeTitle, { name })}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription asChild>
          <div className="flex flex-col gap-2 text-sm text-fg">
            {adding ? (
              <>
                <p>{fmt(yearly ? m.addBodyYearly : m.addBody, planChange)}</p>
                <p className="text-fg-muted">{m.addInvoice}</p>
              </>
            ) : (
              <>
                <p suppressHydrationWarning>
                  {fmt(m.removeBody, { name, date: until ?? "" })}
                </p>
                <p className="text-fg-muted">
                  {fmt(yearly ? m.removePlanYearly : m.removePlan, planChange)}
                </p>
              </>
            )}
          </div>
        </AlertDialogDescription>
        <AlertDialogFooter>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            {messages.common.cancel}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
          >
            {adding ? m.addConfirm : m.removeConfirm}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
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
  const messages = useAppMessages();
  const m = messages.members;
  const name = row.name || row.email;
  switch (row.action) {
    case "remove":
      return (
        <ConfirmAction
          trigger={(open) => (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={open}
              aria-label={fmt(m.remove.label, { name })}
              className="text-destructive"
            >
              <X size={16} />
            </Button>
          )}
          heading={fmt(m.remove.title, { name, workspace: workspaceName })}
          body={[
            m.remove.body,
            ...(paidSeats && row.role === "member"
              ? [
                  fmt(m.remove.freesSeat, {
                    seats: paidSeats.seats,
                    nextSeats: Math.max(1, paidSeats.seats - 1),
                  }),
                ]
              : []),
          ]}
          confirmLabel={messages.common.remove}
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
            <Button variant="secondary" size="sm" onClick={open}>
              <LogOut size={14} />
              {m.leave.button}
            </Button>
          )}
          heading={fmt(m.leave.title, { workspace: workspaceName })}
          body={[m.leave.body, m.leave.comeBack]}
          confirmLabel={m.leave.confirm}
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
            className="text-destructive"
          >
            {m.table.revoke}
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
  const m = useAppMessages();
  const [isOpen, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  return (
    <>
      {trigger(() => setOpen(true))}
      <AlertDialog open={isOpen} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{heading}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-2 text-sm text-fg">
              {body.map((line, i) => (
                <p key={line} className={i > 0 ? "text-fg-muted" : undefined}>
                  {line}
                </p>
              ))}
            </div>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <Button
              variant="secondary"
              size="sm"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              {m.common.cancel}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await onConfirm();
                  setOpen(false);
                })
              }
            >
              {confirmLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
