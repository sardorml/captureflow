"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { markNotificationsReadAction } from "@/app/(dashboard)/notifications/actions";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NotificationFeed } from "@/lib/notification-text";
import { plural } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";
import { useAppLocale, useAppMessages } from "@/components/app-i18n-provider";
import { NotificationList } from "./NotificationList";

const MENU_LIMIT = 6;

/*
 * `base` is the app origin: the viewer can render on a different one, so its
 * links have to be absolute, exactly as the account menu's are.
 *
 * Opening the menu marks stored notifications read; the dots stay until it
 * closes so the reader can still see what was new. Invites stay unread until
 * they are answered.
 */
export function NotificationsMenu({
  base = "",
  feed,
}: {
  base?: string;
  feed: NotificationFeed | null;
}) {
  const copy = useAppMessages().shell.notifications;
  const { lang } = useAppLocale();
  const invites = feed?.invites ?? [];
  const [opened, setOpened] = useState(false);
  const [closed, setClosed] = useState(false);
  const unread = opened ? invites.length : (feed?.unread ?? 0);
  const notifications = (feed?.notifications ?? [])
    .slice(0, Math.max(0, MENU_LIMIT - invites.length))
    .map((row) => (closed ? { ...row, read_at: row.read_at ?? 0 } : row));

  const onOpenChange = (open: boolean) => {
    if (!open) {
      if (opened) setClosed(true);
      return;
    }
    if (!opened && unread > invites.length) {
      void markNotificationsReadAction();
    }
    setOpened(true);
  };

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        aria-label={unread ? plural(copy.bellUnread, unread, lang) : copy.title}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "relative",
        )}
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent side="bottom" align="end" className="w-96">
        <div className="px-3 py-2.5">
          <p className="text-base leading-7 font-semibold text-foreground">
            {copy.title}
          </p>
        </div>

        <DropdownMenuSeparator />

        <NotificationList
          invites={invites}
          notifications={notifications}
          base={base}
          className="max-h-[60vh] overflow-y-auto"
          emptyText={copy.menuEmpty}
        />

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="justify-center">
          <a href={`${base}/notifications`}>{copy.viewAll}</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
