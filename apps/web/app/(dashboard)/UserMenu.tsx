"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { HardDrive, Settings, UserCircle } from "lucide-react";
import type { MenuProps } from "antd";
import { signOut } from "@/lib/auth-client";
import { notifyExtensionSignOut } from "@/lib/extension-bridge";
import {
  AccountMenu,
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

  const navItems: NonNullable<MenuProps["items"]> = [
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
