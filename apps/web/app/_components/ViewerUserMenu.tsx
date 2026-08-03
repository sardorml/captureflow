"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ThemePreference } from "@captureflow/ui";
import { AccountMenu, accountNavItems } from "./AccountMenu";

type Props = {
  userId: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
  // The viewer can render on a different origin than the app, so nav links are
  // absolute and sign-out goes through the cross-origin session-clear relay.
  appWebUrl: string;
  signOutReturnUrl?: string;
  themePreference?: ThemePreference;
};

export function ViewerUserMenu({
  name,
  email,
  imageUrl,
  appWebUrl,
  signOutReturnUrl,
  themePreference,
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

  const navItems = accountNavItems({ base: appWebUrl });

  return (
    <AccountMenu
      name={name}
      email={email}
      imageUrl={imageUrl}
      navItems={navItems}
      themePreference={themePreference}
      signingOut={signingOut}
      onSignOut={onSignOut}
    />
  );
}
