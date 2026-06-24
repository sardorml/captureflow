import { redirect } from "next/navigation";
import { loadSession } from "@/lib/session-guard";
import { issueDeviceToken } from "@/lib/device-tokens";
import { getAppWebEnv } from "@/lib/cf-env";
import { CallbackHandoff } from "./CallbackHandoff";
import { ExtensionHandoff } from "./ExtensionHandoff";
import { classifyReturn } from "./return-target";
import { resolveExtensionTarget } from "./extension-target";

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
  searchParams: Promise<{ label?: string; return?: string; ext?: string }>;
}) {
  const sp = await searchParams;
  const session = await loadSession();
  if (!session) {
    const params = new URLSearchParams();
    if (sp.label) params.set("label", sp.label);
    if (sp.return) params.set("return", sp.return);
    if (sp.ext) params.set("ext", sp.ext);
    const tail = params.toString();
    const next = `/auth/callback${tail ? `?${tail}` : ""}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const label = typeof sp.label === "string" ? sp.label : null;

  // Browser-extension flow: a client island hands the token to the extension
  // via chrome.runtime.sendMessage. The target id is validated and, in
  // production, must match the pinned CAPTUREFLOW_EXTENSION_ID — when that's
  // unset, production fails closed (no token handed out) so an attacker-chosen
  // ?ext= can't direct a token to a look-alike extension. Dev accepts any
  // well-formed id (the unpacked id varies per machine).
  if (sp.ext !== undefined) {
    const env = await getAppWebEnv();
    const allowUnpinned = process.env.NODE_ENV !== "production";
    const extTarget = resolveExtensionTarget(
      sp.ext,
      env?.CAPTUREFLOW_EXTENSION_ID ?? null,
      allowUnpinned,
    );
    if (!extTarget) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-canvas px-4 text-center">
          <p className="max-w-sm text-fg">
            Couldn’t verify the extension. Reinstall it and try again.
          </p>
        </main>
      );
    }
    const issued = await issueDeviceToken(session.user.id, label);
    return (
      <ExtensionHandoff
        extId={extTarget}
        token={issued.rawToken}
        tokenId={issued.id}
        email={session.user.email}
      />
    );
  }

  // Desktop flow: a custom-scheme deep link the OS routes to the app. ?return=
  // is attacker-influenceable, so it's locked to the scheme; anything else falls
  // back to the default deep link.
  const scheme = DEFAULT_SCHEME;
  const target = classifyReturn(sp.return, scheme);
  const issued = await issueDeviceToken(session.user.id, label);
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
