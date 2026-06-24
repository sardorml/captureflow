import { redirect } from "next/navigation";
import { loadSession } from "@/lib/session-guard";
import { issueDeviceToken } from "@/lib/device-tokens";
import { CallbackHandoff } from "./CallbackHandoff";
import { classifyReturn } from "./return-target";

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

  // ?return= is attacker-influenceable, so it's restricted to two safe shapes
  // (custom-scheme deep link, or the extension's chromiumapp.org redirect);
  // anything else falls back to the default deep link.
  const scheme = DEFAULT_SCHEME;
  const target = classifyReturn(sp.return, scheme);
  const label = typeof sp.label === "string" ? sp.label : null;

  const issued = await issueDeviceToken(session.user.id, label);

  // The extension's https redirect is a real navigation chrome.identity
  // intercepts, so hand it back server-side — no client click step needed.
  if (target.kind === "extension") {
    redirect(appendTokenToReturn(target.url, issued.rawToken, issued.id));
  }

  const deepLink =
    target.kind === "deeplink"
      ? appendTokenToReturn(target.url, issued.rawToken, issued.id)
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
