import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { readThemeFromCookieHeader } from "@captureflow/ui/theme";
import { AuthShell } from "@/app/AuthShell";
import { getAppI18n } from "@/lib/i18n/app/server";
import { selfHostHooks } from "@/lib/selfhost";
import { SetPasswordForm } from "./SetPasswordForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { messages: m } = await getAppI18n();
  return {
    title: m.auth.setPassword.title,
    robots: { index: false, follow: false },
  };
}

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
