"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Dropdown, Separator, Typography, buttonVariants } from "@heroui/react";
import { markNotificationsReadAction } from "@/app/(dashboard)/notifications/actions";
import type { NotificationFeed } from "@/lib/notification-text";
import { cn } from "@/lib/utils";
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
    <Dropdown onOpenChange={onOpenChange}>
      <Dropdown.Trigger
        aria-label={
          unread ? `Notifications, ${unread} unread` : "Notifications"
        }
        className={cn(
          buttonVariants({ variant: "ghost", isIconOnly: true }),
          "relative",
        )}
      >
        {/* Class, not the size prop: HeroUI's button sizes the svgs inside it
            (16px past the sm breakpoint), which a prop can't outrank. */}
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] leading-none font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Dropdown.Trigger>

      <Dropdown.Popover placement="bottom end" className="w-96">
        <div className="px-3 py-2.5">
          <Typography weight="semibold">Notifications</Typography>
        </div>

        <Separator />

        <NotificationList
          invites={invites}
          notifications={notifications}
          base={base}
          className="max-h-[60vh] overflow-y-auto"
          emptyText="You’re all caught up. Invites, new teammates, and role changes show up here."
        />

        <Separator />

        <Dropdown.Menu>
          <Dropdown.Item
            href={`${base}/notifications`}
            className="justify-center"
          >
            View all
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
