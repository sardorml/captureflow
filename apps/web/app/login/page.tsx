import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { readThemeFromCookieHeader } from "@captureflow/ui/theme";
import { loadSessionForRedirect } from "@/lib/session-guard";
import { renderTrace } from "@/lib/render-trace";
import { oauthErrorMessage, parseEmailDomains } from "@/lib/auth";
import { getAppWebEnv } from "@/lib/cf-env";
import { AuthForm } from "@/app/AuthForm";
import { AuthShell } from "@/app/AuthShell";
import { inviteContextFromNext } from "@/lib/invite-context";
import { selfHostHooks } from "@/lib/selfhost";

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
  const next = sp.next ?? "/dashboard";
  // Only same-origin path redirects — strip a forged "?next=https://evil".
  const safeNext = next.startsWith("/") ? next : "/dashboard";
  const trace = await renderTrace("/login");
  const session = await loadSessionForRedirect();
  trace("session");
  if (session) redirect(safeNext);

  const theme = readThemeFromCookieHeader((await headers()).get("cookie"));
  const invite = await inviteContextFromNext(safeNext);
  const env = await getAppWebEnv();
  const selfhost = await selfHostHooks();
  const instance = selfhost ? await selfhost.signupState() : null;
  trace("invite and env");
  // A fresh self-hosted install is set up from the admin app instead.
  if (instance?.firstRun) redirect("/admin/setup");
  const canSignUp = !instance || instance.domains.length > 0 || !!invite;
  const initialMode = canSignUp && sp.mode === "signup" ? "signup" : "signin";
  const initialError = oauthErrorMessage(
    sp.error,
    parseEmailDomains(env?.ALLOWED_EMAIL_DOMAINS),
    instance ?? undefined,
  );

  return (
    <AuthShell theme={theme}>
      <AuthForm
        next={safeNext}
        initialMode={initialMode}
        invite={invite}
        initialError={initialError}
        canSignUp={canSignUp}
      />
    </AuthShell>
  );
}
