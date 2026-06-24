/*
 * Where the freshly issued device token gets handed back to the client that
 * started sign-in. The `?return=` param is attacker-influenceable, so it's
 * locked to two safe shapes; anything else is "none" (the caller emits the
 * default deep link). This never widens *who* gets a token — any signed-in
 * visitor to the callback already mints one — only *where* it's sent.
 *   - "extension": the browser extension's https://<id>.chromiumapp.org/ URL.
 *     chrome.identity.launchWebAuthFlow watches for a redirect there; the host
 *     is Chrome-reserved and resolvable only inside the flow, so the caller can
 *     redirect to it server-side.
 *   - "deeplink": a custom-scheme URL the desktop app's OS handler routes;
 *     delivered via a client-side anchor click (Safari blocks unsolicited nav).
 */
export type ReturnTarget =
  | { kind: "extension"; url: string }
  | { kind: "deeplink"; url: string }
  | { kind: "none" };

function isExtensionRedirect(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  // endsWith(".chromiumapp.org") requires a non-empty subdomain label and
  // rejects look-alikes like "evilchromiumapp.org" or "...chromiumapp.org.evil".
  return url.protocol === "https:" && url.hostname.endsWith(".chromiumapp.org");
}

export function classifyReturn(
  rawReturn: string | undefined,
  scheme: string,
): ReturnTarget {
  if (typeof rawReturn !== "string" || rawReturn.length === 0) {
    return { kind: "none" };
  }
  if (rawReturn.startsWith(`${scheme}://`)) {
    return { kind: "deeplink", url: rawReturn };
  }
  if (isExtensionRedirect(rawReturn)) {
    return { kind: "extension", url: rawReturn };
  }
  return { kind: "none" };
}
