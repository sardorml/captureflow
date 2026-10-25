import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { readThemeFromCookieHeader } from "@captureflow/ui/theme";
import { loadSession } from "@/lib/session-guard";
import { oauthErrorMessage, parseEmailDomains } from "@/lib/auth";
import { getAppWebEnv } from "@/lib/cf-env";
import { AuthForm } from "@/app/AuthForm";
import { AuthShell } from "@/app/AuthShell";
import { inviteContextFromNext } from "@/lib/invite-context";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; mode?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next ?? "/recordings";
  // Only same-origin path redirects — strip a forged "?next=https://evil".
  const safeNext = next.startsWith("/") ? next : "/recordings";
  const session = await loadSession();
  if (session) redirect(safeNext);

  const theme = readThemeFromCookieHeader((await headers()).get("cookie"));
  const initialMode = sp.mode === "signup" ? "signup" : "signin";
  const invite = await inviteContextFromNext(safeNext);
  const env = await getAppWebEnv();
  const initialError = oauthErrorMessage(
    sp.error,
    parseEmailDomains(env?.ALLOWED_EMAIL_DOMAINS),
  );

  return (
    <AuthShell theme={theme}>
      <AuthForm
        next={safeNext}
        initialMode={initialMode}
        invite={invite}
        initialError={initialError}
      />
    </AuthShell>
  );
}
