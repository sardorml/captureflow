"use client";

import { useRouter } from "next/navigation";
import { initials } from "@/lib/format";
import { useState } from "react";
import { LayoutDashboard, LogOut, Settings } from "lucide-react";
import { Avatar, Dropdown, Typography, type MenuProps } from "antd";

type Props = {
  userId: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
  appWebUrl: string;
  signOutReturnUrl?: string;
};

export function ViewerUserMenu({
  name,
  email,
  imageUrl,
  appWebUrl,
  signOutReturnUrl,
}: Props) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const displayName = name?.trim() || email;
  const dashboardUrl = `${appWebUrl}/shares`;
  const settingsUrl = `${appWebUrl}/settings`;

  const onSignOut = () => {
    if (signingOut) return;
    setSigningOut(true);
    const back =
      signOutReturnUrl ??
      (typeof window !== "undefined" ? window.location.href : "/");
    window.location.href = `${appWebUrl}/auth/clear?next=${encodeURIComponent(
      back,
    )}`;
    router.refresh();
  };

  const items: MenuProps["items"] = [
    {
      key: "user",
      type: "group",
      label: (
        <div style={{ paddingBlock: 4 }}>
          <Typography.Text strong>{displayName}</Typography.Text>
          <Typography.Text
            type="secondary"
            style={{ display: "block", fontSize: 12 }}
          >
            {email}
          </Typography.Text>
        </div>
      ),
    },
    { type: "divider" },
    {
      key: "dashboard",
      icon: <LayoutDashboard size={16} />,
      label: <a href={dashboardUrl}>Dashboard</a>,
    },
    {
      key: "settings",
      icon: <Settings size={16} />,
      label: <a href={settingsUrl}>Workspace settings</a>,
    },
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
