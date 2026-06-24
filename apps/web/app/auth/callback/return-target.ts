// Where the freshly issued device token gets handed back to the client that
// started the sign-in. The `?return=` param is attacker-influenceable, so it's
// locked to two safe shapes — anything else falls back to the default deep
// link. This never widens *who* gets a token (any signed-in visitor to the
// callback already mints one); it only constrains *where* the token is sent.

export type ReturnTarget =
  // Browser-extension flow: chrome.identity.launchWebAuthFlow watches for a
  // redirect to the extension's https://<id>.chromiumapp.org/ URL. That host is
  // Chrome-reserved and resolvable only inside the flow, so a server redirect
  // straight to it is the cleanest handoff.
  | { kind: "extension"; url: string }
  // Desktop flow: a custom-scheme deep link the OS routes to the app. Delivered
  // via a client-side anchor click (Safari blocks unsolicited scheme nav).
  | { kind: "deeplink"; url: string }
  // No usable return — emit the default deep link for the configured scheme.
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
