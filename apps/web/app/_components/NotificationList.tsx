"use client";

import { useState, useTransition } from "react";
import type { InviteForUser, NotificationRow } from "@captureflow/quota";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { fill } from "@/lib/i18n/fill";
import { cn } from "@/lib/utils";
import { useAppLocale, useAppMessages } from "@/components/app-i18n-provider";

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
  const copy = useAppMessages().shell.notifications;
  const { lang } = useAppLocale();
  const [declined, setDeclined] = useState<string[]>([]);
  const openInvites = invites.filter((i) => !declined.includes(i.id));

  if (openInvites.length === 0 && notifications.length === 0) {
    return (
      <div className="px-3 py-6">
        <p className="text-center text-sm leading-6 text-muted-foreground">
          {emptyText}
        </p>
      </div>
    );
  }

  return (
    <ul className={cn("divide-y divide-border", className)}>
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
          message={notificationMessage(row, copy, lang)}
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
  const copy = useAppMessages().shell.notifications;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const accept = () =>
    startTransition(async () => {
      const result = await acceptInviteFromFeedAction(invite.id);
      if (result.ok) window.location.assign(`${base}/recordings`);
      else setError(result.error ?? copy.acceptErrors.failed);
    });
  const decline = () =>
    startTransition(async () => {
      await declineInviteFromFeedAction(invite.id);
      onDeclined();
    });

  return (
    <Entry
      message={inviteMessage(invite, copy)}
      image={invite.inviter_image}
      at={invite.created_at}
      unread
      base={base}
    >
      <div className="mt-2 flex gap-2">
        <Button size="sm" disabled={pending} onClick={accept}>
          {copy.accept}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={decline}
        >
          {copy.decline}
        </Button>
      </div>
      {error && (
        <p className="mt-1.5 text-sm leading-6 text-destructive">{error}</p>
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
  const copy = useAppMessages().shell.notifications;
  const { lang } = useAppLocale();
  const body = (
    <>
      <Avatar className="size-8 shrink-0">
        {image && <AvatarImage src={image} alt={message.actor} />}
        <AvatarFallback className="text-xs">
          {initials(message.actor)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 text-sm">
        <p className="text-fg">
          {fill(message.text, {
            actor: (
              <strong className="font-semibold text-fg-strong">
                {message.actor}
              </strong>
            ),
            workspace: (
              <strong className="font-semibold text-fg-strong">
                {message.workspace}
              </strong>
            ),
          })}
        </p>
        {message.note && <p className="mt-0.5 text-fg-muted">{message.note}</p>}
        <p className="mt-0.5 text-xs text-fg-subtle">
          {formatRelativeShort(at, lang)}
        </p>
        {children}
      </div>
      {unread && (
        <span
          aria-label={copy.unread}
          className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
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
