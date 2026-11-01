/*
 * Where the freshly issued device token gets handed back to the desktop app:
 * a custom-scheme deep link the OS routes to it, delivered via a client-side
 * anchor click (Safari blocks unsolicited scheme nav). The `?return=` param is
 * attacker-influenceable, so it's locked to the configured scheme, or to a
 * loopback /callback for the local MCP's sign-in (RFC 8252 §7.3), which can only
 * reach the signing-in user's own machine. Anything else is "none" and the
 * caller emits the default deep link. (The browser extension uses a separate
 * ?ext= handshake, not a return URL.)
 */
export type ReturnTarget =
  | { kind: "deeplink"; url: string }
  | { kind: "loopback"; url: string }
  | { kind: "none" };

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "[::1]", "localhost"]);

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
  return isLoopbackCallback(rawReturn)
    ? { kind: "loopback", url: rawReturn }
    : { kind: "none" };
}

function isLoopbackCallback(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  return (
    url.protocol === "http:" &&
    LOOPBACK_HOSTS.has(url.hostname) &&
    url.port !== "" &&
    url.username === "" &&
    url.password === "" &&
    url.pathname === "/callback"
  );
}
