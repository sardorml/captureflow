"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  HardDrive,
  LogOut,
  Settings,
  Sparkles,
  UserCircle,
} from "lucide-react";
import { Avatar, Dropdown, Tag, Typography, type MenuProps } from "antd";
import { signOut } from "@/lib/auth-client";
import { notifyExtensionSignOut } from "@/lib/extension-bridge";

type ProInfo = {
  cycle: "monthly" | "annual";
  status: string;
};

type Props = {
  userId: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
  pro: ProInfo | null;
};

function initials(name: string | null, email: string): string {
  const source = (name ?? "").trim() || email;
  return source
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserMenu({ name, email, imageUrl, pro }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const displayName = name?.trim() || email;

  const onSignOut = async () => {
    if (pending) return;
    setPending(true);
    await signOut();
    notifyExtensionSignOut();
    router.replace("/login");
  };

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
    {
      key: "profile",
      icon: <UserCircle size={16} />,
      label: <Link href="/profile">Profile settings</Link>,
    },
    {
      key: "devices",
      icon: <HardDrive size={16} />,
      label: <Link href="/devices">Connected devices</Link>,
    },
    {
      key: "settings",
      icon: <Settings size={16} />,
      label: <Link href="/settings">Workspace settings</Link>,
    },
    { type: "divider" },
    {
      key: "signout",
      icon: <LogOut size={16} />,
      danger: true,
      disabled: pending,
      label: pending ? "Signing out…" : "Sign out",
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
        {initials(name, email)}
      </Avatar>
    </Dropdown>
  );
}
