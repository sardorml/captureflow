"use client";

import { LogOut, Sparkles } from "lucide-react";
import { Avatar, Dropdown, Tag, Typography, type MenuProps } from "antd";
import { initials } from "@/lib/format";

export type AccountMenuProInfo = {
  cycle: "monthly" | "annual";
  status: string;
};

type Props = {
  name: string | null;
  email: string;
  imageUrl: string | null;
  pro?: AccountMenuProInfo | null;
  // Surface-specific middle section (dashboard links vs viewer cross-origin
  // links); the header, divider rhythm, and Sign out are owned here so every
  // surface renders the same account menu.
  navItems: NonNullable<MenuProps["items"]>;
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

  const items: MenuProps["items"] = [
    {
      key: "user",
      type: "group",
      label: (
        <div style={{ paddingBlock: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Typography.Text strong>{displayName}</Typography.Text>
            {pro && (
              <Tag
                color="blue"
                icon={<Sparkles size={10} />}
                style={{ marginInlineEnd: 0 }}
              >
                Pro
              </Tag>
            )}
          </div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {email}
          </Typography.Text>
        </div>
      ),
    },
    { type: "divider" },
    ...navItems,
    { type: "divider" },
    {
      key: "signout",
      icon: <LogOut size={16} />,
      danger: true,
      disabled: signingOut,
      label: signingOut ? "Signing out…" : "Sign out",
      onClick: onSignOut,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
      <Avatar
        src={imageUrl || undefined}
        style={{ cursor: "pointer" }}
        aria-label="Account menu"
      >
        {initials(displayName)}
      </Avatar>
    </Dropdown>
  );
}
