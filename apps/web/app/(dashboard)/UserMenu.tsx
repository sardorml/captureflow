"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ThemePreference } from "@captureflow/ui";
import { signOut } from "@/lib/auth-client";
import { notifyExtensionSignOut } from "@/lib/extension-bridge";
import {
  AccountMenu,
  accountNavItems,
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

  const navItems = accountNavItems({ pro });

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
