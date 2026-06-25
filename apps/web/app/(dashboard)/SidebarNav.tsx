"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Link2, Settings, Users } from "lucide-react";
import { ConfigProvider, Menu, theme, type MenuProps } from "antd";

const KEYS = ["/recordings", "/screenshots", "/members", "/settings"];

export function SidebarNav({ isOwner }: { isOwner: boolean }) {
  const { token } = theme.useToken();
  const pathname = usePathname();
  const selected =
    KEYS.find((k) => pathname === k || pathname.startsWith(k + "/")) ?? "";

  // Inline padding lands on the <li>, overriding antd's class-based indent so
  // the icon sits at 28px (12px itemMarginInline + 16px) — flush with the
  // switcher. Margin stays in the token so antd's item width calc matches it.
  const itemStyle = { paddingInline: "16px 8px" };

  const items: MenuProps["items"] = [
    {
      key: "/recordings",
      icon: <Link2 size={16} />,
      label: <Link href="/recordings">Recordings</Link>,
      style: itemStyle,
    },
    {
      key: "/screenshots",
      icon: <Camera size={16} />,
      label: <Link href="/screenshots">Screenshots</Link>,
      style: itemStyle,
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
                style: itemStyle,
              },
              {
                key: "/settings",
                icon: <Settings size={16} />,
                label: <Link href="/settings">Workspace</Link>,
                style: itemStyle,
              },
            ],
          },
        ] satisfies MenuProps["items"])
      : []),
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemHeight: 32,
            itemBorderRadius: 6,
            itemMarginInline: 12,
            itemSelectedBg: token.colorPrimaryBgHover,
            // High-contrast foreground (not the blue colorPrimary) so the
            // selected label/icon stay legible on the tinted pill — blue-on-blue
            // read too dark in dark mode.
            itemSelectedColor: token.colorText,
          },
        },
      }}
    >
      <Menu
        rootClassName="cf-sidebar-menu"
        mode="inline"
        selectedKeys={selected ? [selected] : []}
        items={items}
        style={{ borderInlineEnd: 0, background: "transparent" }}
      />
    </ConfigProvider>
  );
}
