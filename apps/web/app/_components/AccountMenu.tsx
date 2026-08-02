"use client";

import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { Avatar, Dropdown, Separator, Typography } from "@heroui/react";
import type { Theme } from "@captureflow/ui";
import { initials } from "@/lib/format";
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
  // Renders the theme row when the surface can supply the current theme.
  theme?: Theme;
  signingOut: boolean;
  onSignOut: () => void;
};

export function AccountMenu({
  name,
  email,
  imageUrl,
  navItems,
  theme,
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

        {theme ? (
          <>
            <Separator />
            <ThemeSegments initialTheme={theme} />
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
