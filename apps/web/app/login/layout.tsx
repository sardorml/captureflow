import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { readThemeFromCookieHeader } from "@captureflow/ui/theme";
import { AuthShell } from "@/app/AuthShell";
import { LOGIN_NEXT_HEADER, safeNextPath } from "@/lib/login-next";
import { signupState } from "@/lib/selfhost";
import { loadSessionForRedirect } from "@/lib/session-guard";

/*
 * The shell lives here so it paints before the page's lookups finish and stays
 * mounted when the form replaces the skeleton. Whoever has no use for the form
 * is sent on from here too: once the shell is out, a redirect can only happen
 * in the browser, after the loading card has shown.
 */
export default async function LoginLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const head = await headers();
  if (await loadSessionForRedirect()) {
    redirect(safeNextPath(head.get(LOGIN_NEXT_HEADER)));
  }
  // A fresh self-hosted install is set up from the admin app instead.
  if ((await signupState())?.firstRun) redirect("/admin/setup");
  const theme = readThemeFromCookieHeader(head.get("cookie"));
  return <AuthShell theme={theme}>{children}</AuthShell>;
}
