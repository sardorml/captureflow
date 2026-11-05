import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loadSessionForRedirect } from "@/lib/session-guard";
import { renderTrace } from "@/lib/render-trace";
import { oauthErrorMessage, parseEmailDomains } from "@/lib/auth";
import { getAppWebEnv } from "@/lib/cf-env";
import { AuthForm } from "@/app/AuthForm";
import { getAppI18n } from "@/lib/i18n/app/server";
import { inviteContextFromNext } from "@/lib/invite-context";
import { safeNextPath } from "@/lib/login-next";
import { signupState } from "@/lib/selfhost";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { messages: m } = await getAppI18n();
  return {
    title: m.auth.login.metaTitle,
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; mode?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const safeNext = safeNextPath(sp.next);
  const trace = await renderTrace("/login");
  const session = await loadSessionForRedirect();
  trace("session");
  if (session) redirect(safeNext);

  const { messages: m } = await getAppI18n();
  const invite = await inviteContextFromNext(safeNext, m.auth.inviteFallbacks);
  const env = await getAppWebEnv();
  const instance = await signupState();
  trace("invite and env");
  // A fresh self-hosted install is set up from the admin app instead.
  if (instance?.firstRun) redirect("/admin/setup");
  const canSignUp = !instance || instance.domains.length > 0 || !!invite;
  const initialMode = canSignUp && sp.mode === "signup" ? "signup" : "signin";
  const initialError = oauthErrorMessage(
    sp.error,
    parseEmailDomains(env?.ALLOWED_EMAIL_DOMAINS),
    instance ?? undefined,
    m.auth.oauthErrors,
  );

  return (
    <AuthForm
      next={safeNext}
      initialMode={initialMode}
      invite={invite}
      initialError={initialError}
      canSignUp={canSignUp}
    />
  );
}
