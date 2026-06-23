import { redirect } from "next/navigation";
import { loadSession } from "@/lib/session-guard";
import { issueDeviceToken } from "@/lib/device-tokens";
import { CallbackHandoff } from "./CallbackHandoff";

export const dynamic = "force-dynamic";

const DEFAULT_SCHEME = "captureflow";

function buildDeepLink(scheme: string, token: string, tokenId: string): string {
  const u = new URL(`${scheme}://auth/callback`);
  u.searchParams.set("token", token);
  u.searchParams.set("id", tokenId);
  return u.toString();
}

export default async function CallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ label?: string; return?: string }>;
}) {
  const sp = await searchParams;
  const session = await loadSession();
  if (!session) {
    const params = new URLSearchParams();
    if (sp.label) params.set("label", sp.label);
    if (sp.return) params.set("return", sp.return);
    const tail = params.toString();
    const next = `/auth/callback${tail ? `?${tail}` : ""}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  // Lock ?return= to the configured scheme so a hostile referrer can't
  // redirect into javascript: or http:.
  const scheme = DEFAULT_SCHEME;
  const requestedReturn =
    typeof sp.return === "string" && sp.return.startsWith(`${scheme}://`)
      ? sp.return
      : null;
  const label = typeof sp.label === "string" ? sp.label : null;

  const issued = await issueDeviceToken(session.user.id, label);
  const deepLink = requestedReturn
    ? appendTokenToReturn(requestedReturn, issued.rawToken, issued.id)
    : buildDeepLink(scheme, issued.rawToken, issued.id);

  return <CallbackHandoff deepLink={deepLink} email={session.user.email} />;
}

function appendTokenToReturn(
  returnUrl: string,
  token: string,
  tokenId: string,
): string {
  try {
    const u = new URL(returnUrl);
    u.searchParams.set("token", token);
    u.searchParams.set("id", tokenId);
    return u.toString();
  } catch {
    return buildDeepLink(DEFAULT_SCHEME, token, tokenId);
  }
}
