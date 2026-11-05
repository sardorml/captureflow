import type { InviteForUser, NotificationRow } from "@captureflow/quota";
import type { AppMessages } from "@/lib/i18n/app/messages";
import { fmt } from "@/lib/i18n/format";
import { formatDate } from "@/lib/i18n/intl";

export type NotificationFeed = {
  invites: InviteForUser[];
  notifications: NotificationRow[];
  unread: number;
};

type NotificationCopy = AppMessages["shell"]["notifications"];

// `text` is the sentence with {actor} and {workspace} slots left for the list
// to fill with the two names.
export type NotificationMessage = {
  actor: string;
  workspace: string;
  text: string;
  note: string | null;
  href: string | null;
};

// English keeps its day-first date; a bare "en" would print "November 12".
function untilDate(ms: number, lang: string): string {
  return formatDate(
    ms,
    lang,
    { day: "numeric", month: "long", timeZone: "UTC" },
    "en-GB",
  );
}

export function notificationMessage(
  row: NotificationRow,
  copy: NotificationCopy,
  lang: string,
): NotificationMessage {
  const actor = row.actor_name?.trim() || row.actor_email || copy.someone;
  const workspace = row.workspace_name;
  const base = { actor, workspace, note: null, href: null };
  switch (row.kind) {
    case "member_joined":
      return {
        ...base,
        text: copy.message.joined[row.role ?? "member"],
        href: "/members",
      };
    case "seat_requested":
      return { ...base, text: copy.message.seatRequested, href: "/members" };
    case "seat_denied":
      return { ...base, text: copy.message.seatDenied };
    case "role_changed":
      return {
        ...base,
        text: copy.message.roleChanged[row.role ?? "member"],
      };
    case "downgrade_scheduled":
      return {
        ...base,
        text: copy.message.downgraded,
        note:
          row.effective_at === null
            ? null
            : fmt(copy.message.keepRecordingUntil, {
                date: untilDate(row.effective_at, lang),
              }),
      };
    case "removed":
      return { ...base, text: copy.message.removed };
  }
}

export function inviteMessage(
  invite: InviteForUser,
  copy: NotificationCopy,
): NotificationMessage {
  return {
    actor: invite.inviter_name?.trim() || copy.someone,
    workspace: invite.workspace_name,
    text: copy.message.invited[invite.role],
    note: null,
    href: null,
  };
}
