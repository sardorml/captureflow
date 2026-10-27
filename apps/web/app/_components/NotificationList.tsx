"use client";

import { useState, useTransition } from "react";
import { Avatar, Button, Typography } from "@heroui/react";
import type { InviteForUser, NotificationRow } from "@captureflow/quota";
import {
  acceptInviteFromFeedAction,
  declineInviteFromFeedAction,
} from "@/app/(dashboard)/notifications/actions";
import { formatRelativeShort, initials } from "@/lib/format";
import {
  inviteMessage,
  notificationMessage,
  type NotificationMessage,
} from "@/lib/notification-text";
import { cn } from "@/lib/utils";

export function NotificationList({
  invites,
  notifications,
  base = "",
  emptyText,
  className,
}: {
  invites: InviteForUser[];
  notifications: NotificationRow[];
  base?: string;
  emptyText: string;
  className?: string;
}) {
  const [declined, setDeclined] = useState<string[]>([]);
  const openInvites = invites.filter((i) => !declined.includes(i.id));

  if (openInvites.length === 0 && notifications.length === 0) {
    return (
      <div className="px-3 py-6">
        <Typography type="body-sm" color="muted" align="center">
          {emptyText}
        </Typography>
      </div>
    );
  }

  return (
    <ul className={cn("divide-y divide-separator", className)}>
      {openInvites.map((invite) => (
        <InviteEntry
          key={invite.id}
          invite={invite}
          base={base}
          onDeclined={() => setDeclined((ids) => [...ids, invite.id])}
        />
      ))}
      {notifications.map((row) => (
        <Entry
          key={row.id}
          message={notificationMessage(row)}
          image={row.actor_image}
          at={row.created_at}
          unread={row.read_at === null}
          base={base}
        />
      ))}
    </ul>
  );
}

function InviteEntry({
  invite,
  base,
  onDeclined,
}: {
  invite: InviteForUser;
  base: string;
  onDeclined: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const accept = () =>
    startTransition(async () => {
      const result = await acceptInviteFromFeedAction(invite.id);
      if (result.ok) window.location.assign(`${base}/recordings`);
      else setError(result.error ?? "Couldn’t accept the invitation");
    });
  const decline = () =>
    startTransition(async () => {
      await declineInviteFromFeedAction(invite.id);
      onDeclined();
    });

  return (
    <Entry
      message={inviteMessage(invite)}
      image={invite.inviter_image}
      at={invite.created_at}
      unread
      base={base}
    >
      <div className="mt-2 flex gap-2">
        <Button
          size="sm"
          variant="primary"
          isDisabled={pending}
          onPress={accept}
        >
          Accept
        </Button>
        <Button
          size="sm"
          variant="secondary"
          isDisabled={pending}
          onPress={decline}
        >
          Decline
        </Button>
      </div>
      {error && (
        <Typography type="body-sm" className="mt-1.5 text-danger">
          {error}
        </Typography>
      )}
    </Entry>
  );
}

function Entry({
  message,
  image,
  at,
  unread,
  base,
  children,
}: {
  message: NotificationMessage;
  image: string | null;
  at: number;
  unread: boolean;
  base: string;
  children?: React.ReactNode;
}) {
  const body = (
    <>
      <Avatar className="size-8 shrink-0">
        {image && <Avatar.Image src={image} alt={message.actor} />}
        <Avatar.Fallback className="text-xs">
          {initials(message.actor)}
        </Avatar.Fallback>
      </Avatar>
      <div className="min-w-0 flex-1 text-sm">
        <p className="text-fg">
          <strong className="font-semibold text-fg-strong">
            {message.actor}
          </strong>{" "}
          {message.action}{" "}
          <strong className="font-semibold text-fg-strong">
            {message.workspace}
          </strong>
          {message.suffix && ` ${message.suffix}`}
        </p>
        {message.note && <p className="mt-0.5 text-fg-muted">{message.note}</p>}
        <p className="mt-0.5 text-xs text-fg-subtle">
          {formatRelativeShort(at)}
        </p>
        {children}
      </div>
      {unread && (
        <span
          aria-label="Unread"
          className="mt-1.5 size-2 shrink-0 rounded-full bg-accent"
        />
      )}
    </>
  );

  return (
    <li>
      {message.href ? (
        <a
          href={`${base}${message.href}`}
          className="flex gap-3 px-3 py-3 hover:bg-tint"
        >
          {body}
        </a>
      ) : (
        <div className="flex gap-3 px-3 py-3">{body}</div>
      )}
    </li>
  );
}
