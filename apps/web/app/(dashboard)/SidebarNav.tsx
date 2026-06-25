"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Link2, Settings, Users } from "lucide-react";
import { Menu, type MenuProps } from "antd";

const KEYS = ["/shares", "/snaps", "/members", "/settings"];

export function SidebarNav({ isOwner }: { isOwner: boolean }) {
  const pathname = usePathname();
  const selected =
    KEYS.find((k) => pathname === k || pathname.startsWith(k + "/")) ?? "";

  const items: MenuProps["items"] = [
    {
      key: "/shares",
      icon: <Link2 size={16} />,
      label: <Link href="/shares">Shares</Link>,
    },
    {
      key: "/snaps",
      icon: <Camera size={16} />,
      label: <Link href="/snaps">Snaps</Link>,
    },
    ...(isOwner
      ? ([
          { type: "divider" },
          {
            key: "admin",
            type: "group",
            label: "Admin tools",
            children: [
              {
                key: "/members",
                icon: <Users size={16} />,
                label: <Link href="/members">Members</Link>,
              },
              {
                key: "/settings",
                icon: <Settings size={16} />,
                label: <Link href="/settings">Workspace</Link>,
              },
            ],
          },
        ] satisfies MenuProps["items"])
      : []),
  ];

  return (
    <Menu
      mode="inline"
      selectedKeys={selected ? [selected] : []}
      items={items}
      style={{ borderInlineEnd: 0, background: "transparent" }}
    />
  );
}
