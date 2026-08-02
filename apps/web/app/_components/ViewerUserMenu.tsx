"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Settings } from "lucide-react";
import { AccountMenu, type AccountMenuNavItem } from "./AccountMenu";

type Props = {
  userId: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
  // The viewer can render on a different origin than the app, so nav links are
  // absolute and sign-out goes through the cross-origin session-clear relay.
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

  const navItems: AccountMenuNavItem[] = [
    {
      key: "dashboard",
      icon: <LayoutDashboard size={16} />,
      label: "Dashboard",
      href: `${appWebUrl}/recordings`,
    },
    {
      key: "settings",
      icon: <Settings size={16} />,
      label: "Workspace settings",
      href: `${appWebUrl}/settings`,
    },
  ];

  return (
    <AccountMenu
      name={name}
      email={email}
      imageUrl={imageUrl}
      navItems={navItems}
      signingOut={signingOut}
      onSignOut={onSignOut}
    />
  );
}
