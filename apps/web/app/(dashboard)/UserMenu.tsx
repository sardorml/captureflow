"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HardDrive, Settings, UserCircle } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { notifyExtensionSignOut } from "@/lib/extension-bridge";
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
};

export function UserMenu({ name, email, imageUrl, pro }: Props) {
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
      key: "profile",
      icon: <UserCircle size={16} />,
      label: "Profile settings",
      href: "/profile",
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
      label: "Workspace settings",
      href: "/settings",
    },
  ];

  return (
    <AccountMenu
      name={name}
      email={email}
      imageUrl={imageUrl}
      pro={pro}
      navItems={navItems}
      signingOut={pending}
      onSignOut={() => void onSignOut()}
    />
  );
}
