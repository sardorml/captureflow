"use client";

import type { ReactNode } from "react";
import { LogOut, Sparkles } from "lucide-react";
import { Avatar, Chip, Dropdown, Separator, Typography } from "@heroui/react";
import { initials } from "@/lib/format";

export type AccountMenuProInfo = {
  cycle: "monthly" | "annual";
  status: string;
};

export type AccountMenuNavItem = {
  key: string;
  icon: ReactNode;
  label: string;
  href: string;
};

type Props = {
  name: string | null;
  email: string;
  imageUrl: string | null;
  pro?: AccountMenuProInfo | null;
  /*
   * Surface-specific middle section (dashboard links vs viewer cross-origin
   * links); the header, divider rhythm, and Sign out are owned here so every
   * surface renders the same account menu.
   */
  navItems: AccountMenuNavItem[];
  signingOut: boolean;
  onSignOut: () => void;
};

export function AccountMenu({
  name,
  email,
  imageUrl,
  pro,
  navItems,
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
        <Avatar className="h-8 w-8">
          {imageUrl && <Avatar.Image src={imageUrl} alt={displayName} />}
          <Avatar.Fallback>{initials(displayName)}</Avatar.Fallback>
        </Avatar>
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end" className="min-w-56">
        <div className="px-3 py-2">
          <div className="flex items-center gap-1.5">
            <Typography weight="semibold">{displayName}</Typography>
            {pro && (
              <Chip size="sm" color="accent">
                <Sparkles size={10} />
                Pro
              </Chip>
            )}
          </div>
          <Typography type="body-xs" color="muted">
            {email}
          </Typography>
        </div>
        <Separator />
        <Dropdown.Menu>
          {navItems.map((item) => (
            <Dropdown.Item key={item.key} href={item.href}>
              {item.icon}
              {item.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
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
