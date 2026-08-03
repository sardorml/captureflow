"use client";

import type { ReactNode } from "react";
import {
  HardDrive,
  Inbox,
  LogOut,
  MessageSquare,
  Receipt,
  Settings,
} from "lucide-react";
import { Avatar, Chip, Dropdown, Separator, Typography } from "@heroui/react";
import type { ThemePreference } from "@captureflow/ui";
import { initials } from "@/lib/format";
import { SUPPORT_EMAIL } from "@/lib/marketing/constants";
import { ThemeSegments } from "./ThemeSegments";

export type AccountMenuProInfo = {
  cycle: "monthly" | "annual";
  status: string;
};

export type AccountMenuNavItem = {
  key: string;
  icon: ReactNode;
  label: string;
  href: string;
  // Right-aligned accessory — a plan chip, a count. Purely decorative.
  trailing?: ReactNode;
};

/*
 * The one account nav list. Both surfaces build from it so they can't drift:
 * the viewer renders on a possibly different origin, so it passes an absolute
 * base, and it has no subscription to hand over — the plan chip is dropped
 * there rather than guessed at.
 */
export function accountNavItems({
  base = "",
  pro,
}: {
  base?: string;
  pro?: AccountMenuProInfo | null;
}): AccountMenuNavItem[] {
  return [
    {
      key: "billing",
      icon: <Receipt size={16} />,
      label: "Billing",
      href: `${base}/billing`,
      trailing:
        pro === undefined ? undefined : (
          <Chip size="sm" color={pro ? "accent" : "default"}>
            {pro ? "Pro" : "Free"}
          </Chip>
        ),
    },
    {
      key: "devices",
      icon: <HardDrive size={16} />,
      label: "Connected devices",
      href: `${base}/devices`,
    },
    {
      key: "settings",
      icon: <Settings size={16} />,
      label: "Settings",
      href: `${base}/settings`,
    },
    {
      key: "feedback",
      icon: <Inbox size={16} />,
      label: "Feedback",
      href: `${base}/suggest-feature`,
    },
    {
      key: "support",
      icon: <MessageSquare size={16} />,
      label: "Contact support",
      href: `mailto:${SUPPORT_EMAIL}`,
    },
  ];
}

type Props = {
  name: string | null;
  email: string;
  imageUrl: string | null;
  pro?: AccountMenuProInfo | null;
  // Built by accountNavItems above; taken as a prop so a surface can pass its
  // own base URL and plan chip.
  navItems: AccountMenuNavItem[];
  // Renders the theme row when the surface can supply the stored preference.
  themePreference?: ThemePreference;
  signingOut: boolean;
  onSignOut: () => void;
};

export function AccountMenu({
  name,
  email,
  imageUrl,
  navItems,
  themePreference,
  signingOut,
  onSignOut,
}: Props) {
  const displayName = name?.trim() || email;

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label="Account menu"
        className="cursor-pointer rounded-full outline-none"
      >
        {/* 36px, the height of the buttons either side of it. */}
        <Avatar className="h-9 w-9">
          {imageUrl && <Avatar.Image src={imageUrl} alt={displayName} />}
          <Avatar.Fallback>{initials(displayName)}</Avatar.Fallback>
        </Avatar>
      </Dropdown.Trigger>

      <Dropdown.Popover placement="bottom end" className="w-64">
        {/* Identity reads as one block: avatar beside the name and address,
            rather than the name alone over the address. */}
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <Avatar className="h-9 w-9 shrink-0">
            {imageUrl && <Avatar.Image src={imageUrl} alt={displayName} />}
            <Avatar.Fallback>{initials(displayName)}</Avatar.Fallback>
          </Avatar>
          <div className="min-w-0">
            <Typography weight="semibold" className="truncate">
              {displayName}
            </Typography>
            <Typography type="body-xs" color="muted" className="truncate">
              {email}
            </Typography>
          </div>
        </div>

        <Separator />

        <Dropdown.Menu>
          {navItems.map((item) => (
            <Dropdown.Item key={item.key} href={item.href}>
              {item.icon}
              {item.label}
              {item.trailing ? (
                <span className="ms-auto ps-2">{item.trailing}</span>
              ) : null}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>

        {themePreference ? (
          <>
            <Separator />
            <ThemeSegments initialPreference={themePreference} />
          </>
        ) : null}

        <Separator />

        <Dropdown.Menu>
          <Dropdown.Item
            isDisabled={signingOut}
            onAction={onSignOut}
            className="text-danger"
          >
            <LogOut size={16} />
            {signingOut ? "Signing out…" : "Sign out"}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
