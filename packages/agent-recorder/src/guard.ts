import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function ipv4Private(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number) as [number, number];
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

// Loopback, private, link-local (cloud metadata lives there), CGNAT, multicast and reserved ranges.
export function isPrivateAddress(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) return ipv4Private(ip);
  if (family !== 6) return true;
  const v6 = ip.toLowerCase();
  const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return ipv4Private(mapped[1]!);
  return (
    v6 === "::" ||
    v6 === "::1" ||
    v6.startsWith("fc") ||
    v6.startsWith("fd") ||
    v6.startsWith("fe8") ||
    v6.startsWith("fe9") ||
    v6.startsWith("fea") ||
    v6.startsWith("feb") ||
    v6.startsWith("ff")
  );
}

/*
 * Whether the browser may load this URL: http(s) only, and never an address
 * on a private network, so an agent can't point the recorder at the
 * container's own network. Hostnames are resolved and every answer checked.
 */
export async function isAllowedUrl(
  raw: string,
  resolve: (host: string) => Promise<string[]> = async (host) =>
    (await lookup(host, { all: true })).map((a) => a.address),
): Promise<boolean> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol === "data:" || url.protocol === "blob:") return true;
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host)) return !isPrivateAddress(host);
  if (host === "localhost" || host.endsWith(".localhost")) return false;
  try {
    const addresses = await resolve(host);
    return addresses.length > 0 && !addresses.some(isPrivateAddress);
  } catch {
    return false;
  }
}
