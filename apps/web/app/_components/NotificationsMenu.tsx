"use client";

import { Bell } from "lucide-react";
import { Dropdown, Separator, Typography, buttonVariants } from "@heroui/react";

/*
 * There is no notification feed yet — the page this links to is the same empty
 * state. The popover exists so the bell answers in place once there is one,
 * and "View all" is the way through to the full list either way.
 *
 * `base` is the app origin: the viewer can render on a different one, so its
 * links have to be absolute, exactly as the account menu's are.
 */
export function NotificationsMenu({ base = "" }: { base?: string }) {
  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label="Notifications"
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          isIconOnly: true,
        })}
      >
        <Bell size={18} />
      </Dropdown.Trigger>

      <Dropdown.Popover placement="bottom end" className="w-80">
        <div className="px-3 py-2.5">
          <Typography weight="semibold">Notifications</Typography>
        </div>

        <Separator />

        <div className="px-3 py-6">
          <Typography type="body-sm" color="muted" align="center">
            You&rsquo;re all caught up. Views, comments, and new teammates show
            up here.
          </Typography>
        </div>

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
