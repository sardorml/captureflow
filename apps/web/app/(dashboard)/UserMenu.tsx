"use client";

import { useState } from "react";
import type { ThemePreference } from "@captureflow/ui";
import { notifyExtensionSignOut } from "@/lib/extension-bridge";
import { signOutAction } from "./sign-out-action";
import {
  AccountMenu,
  accountNavItems,
  type AccountMenuProInfo,
} from "@/app/_components/AccountMenu";

/*
 * A dead connection never rejects the action, it just never answers, so the
 * menu would sit on "Signing out…" forever. Past a cold start's worth of
 * waiting we give up on the action and clear the cookies by navigation
 * instead, which gets the browser onto a fresh request.
 */
const SIGN_OUT_TIMEOUT_MS = 10_000;

function stall(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("sign-out timed out")), ms),
  );
}

// The action's own redirect reaches the client as a rejection too, with the
// router already navigating; only every other failure needs the fallback.
function isRedirect(err: unknown): boolean {
  const digest = (err as { digest?: unknown } | null)?.digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

type Props = {
  userId: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
  pro: AccountMenuProInfo | null;
  selfHosted: boolean;
  themePreference: ThemePreference;
};

export function UserMenu({
  name,
  email,
  imageUrl,
  pro,
  selfHosted,
  themePreference,
}: Props) {
  const [pending, setPending] = useState(false);

  const onSignOut = async () => {
    if (pending) return;
    setPending(true);
    notifyExtensionSignOut();
    try {
      await Promise.race([signOutAction(), stall(SIGN_OUT_TIMEOUT_MS)]);
    } catch (err) {
      if (!isRedirect(err)) window.location.assign("/auth/clear");
    }
  };

  const navItems = accountNavItems({ pro, selfHosted });

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
