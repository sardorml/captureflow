import type { InviteForUser, NotificationRow } from "@captureflow/quota";

export type NotificationFeed = {
  invites: InviteForUser[];
  notifications: NotificationRow[];
  unread: number;
};

export type NotificationMessage = {
  actor: string;
  action: string;
  workspace: string;
  suffix: string | null;
  note: string | null;
  href: string | null;
};

function untilDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export function notificationMessage(row: NotificationRow): NotificationMessage {
  const actor = row.actor_name?.trim() || row.actor_email || "Someone";
  const workspace = row.workspace_name;
  const base = { actor, workspace, suffix: null, note: null, href: null };
  switch (row.kind) {
    case "member_joined":
      return {
        ...base,
        action: "joined",
        suffix: `as a ${row.role ?? "member"}`,
        href: "/members",
      };
    case "seat_requested":
      return { ...base, action: "asked for a paid seat in", href: "/members" };
    case "seat_denied":
      return { ...base, action: "declined your seat request in" };
    case "role_changed":
      return {
        ...base,
        action: `made you a ${row.role ?? "member"} in`,
      };
    case "downgrade_scheduled":
      return {
        ...base,
        action: "moved you to viewer in",
        note:
          row.effective_at === null
            ? null
            : `You can keep recording until ${untilDate(row.effective_at)}.`,
      };
    case "removed":
      return { ...base, action: "removed you from" };
  }
}

export function inviteMessage(invite: InviteForUser): NotificationMessage {
  return {
    actor: invite.inviter_name?.trim() || "Someone",
    action: "invited you to join",
    workspace: invite.workspace_name,
    suffix: `as a ${invite.role}`,
    note: null,
    href: null,
  };
}
