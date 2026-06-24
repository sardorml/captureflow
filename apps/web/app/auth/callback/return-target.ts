/*
 * Where the freshly issued device token gets handed back to the desktop app:
 * a custom-scheme deep link the OS routes to it, delivered via a client-side
 * anchor click (Safari blocks unsolicited scheme nav). The `?return=` param is
 * attacker-influenceable, so it's locked to the configured scheme; anything
 * else is "none" and the caller emits the default deep link. (The browser
 * extension uses a separate ?ext= handshake, not a return URL.)
 */
export type ReturnTarget = { kind: "deeplink"; url: string } | { kind: "none" };

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
  return { kind: "none" };
}
