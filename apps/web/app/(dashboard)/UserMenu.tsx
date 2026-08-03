"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  HardDrive,
  Inbox,
  MessageSquare,
  Receipt,
  Settings,
} from "lucide-react";
import { Chip } from "@heroui/react";
import type { ThemePreference } from "@captureflow/ui";
import { signOut } from "@/lib/auth-client";
import { notifyExtensionSignOut } from "@/lib/extension-bridge";
import { SUPPORT_EMAIL } from "@/lib/marketing/constants";
import {
  AccountMenu,
  type AccountMenuNavItem,
  type AccountMenuProInfo,
} from "@/app/_components/AccountMenu";

type Props = {
  userId: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
  pro: AccountMenuProInfo | null;
  themePreference: ThemePreference;
};

export function UserMenu({
  name,
  email,
  imageUrl,
  pro,
  themePreference,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const onSignOut = async () => {
    if (pending) return;
    setPending(true);
    await signOut();
    notifyExtensionSignOut();
    router.replace("/login");
  };

  const navItems: AccountMenuNavItem[] = [
    {
      key: "billing",
      icon: <Receipt size={16} />,
      label: "Billing",
      // No billing page of our own — the plan is bought through the upgrade
      // modal, which this query param opens.
      href: "/recordings?upgrade=1",
      trailing: (
        <Chip size="sm" color={pro ? "accent" : "default"}>
          {pro ? "Pro" : "Free"}
        </Chip>
      ),
    },
    {
      key: "devices",
      icon: <HardDrive size={16} />,
      label: "Connected devices",
      href: "/devices",
    },
    {
      key: "settings",
      icon: <Settings size={16} />,
      label: "Settings",
      href: "/settings",
    },
    {
      key: "feedback",
      icon: <Inbox size={16} />,
      label: "Feedback",
      href: "/suggest-feature",
    },
    {
      key: "support",
      icon: <MessageSquare size={16} />,
      label: "Contact support",
      href: `mailto:${SUPPORT_EMAIL}`,
    },
  ];

  return (
    <AccountMenu
      name={name}
      email={email}
      imageUrl={imageUrl}
      pro={pro}
      navItems={navItems}
      themePreference={themePreference}
      signingOut={pending}
      onSignOut={() => void onSignOut()}
    />
  );
}
