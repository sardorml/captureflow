import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { readThemeFromCookieHeader } from "@captureflow/ui/theme";
import { AuthShell } from "@/app/AuthShell";
import { selfHostHooks } from "@/lib/selfhost";
import { SetPasswordForm } from "./SetPasswordForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Set your password",
  robots: { index: false, follow: false },
};

// Only a self-hosted administrator hands these links out, from the admin area.
export default async function SetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const selfhost = await selfHostHooks();
  if (!selfhost) notFound();
  const { token } = await params;
  const email = await selfhost.passwordLinkEmail(token);
  const theme = readThemeFromCookieHeader((await headers()).get("cookie"));
  return (
    <AuthShell theme={theme}>
      <SetPasswordForm token={token} email={email} />
    </AuthShell>
  );
}
