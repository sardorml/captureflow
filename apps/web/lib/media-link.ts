/*
 * Expiring links for non-public media. The storage key is sealed (AES-GCM)
 * into the link, never sent in the clear: the public CDN serves the same
 * bucket, so a key a viewer once saw would outlive any expiry.
 */

export const MEDIA_LINK_TTL_MS = 6 * 60 * 60 * 1000;

const IV_BYTES = 12;
const encoder = new TextEncoder();

async function sealingKey(secret: string): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    "HKDF",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(),
      info: encoder.encode("captureflow media link v1"),
    },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function toBase64Url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(s)) return null;
  try {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

export async function sealMediaLink(
  secret: string,
  storageKey: string,
  now = Date.now(),
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const payload = encoder.encode(
    JSON.stringify({ k: storageKey, e: now + MEDIA_LINK_TTL_MS }),
  );
  const sealed = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      await sealingKey(secret),
      payload,
    ),
  );
  const out = new Uint8Array(IV_BYTES + sealed.length);
  out.set(iv);
  out.set(sealed, IV_BYTES);
  return toBase64Url(out);
}

// The storage key, or null when the link is forged, tampered with or expired.
export async function openMediaLink(
  secret: string,
  token: string,
  now = Date.now(),
): Promise<string | null> {
  const bytes = fromBase64Url(token);
  if (!bytes || bytes.length <= IV_BYTES) return null;
  let plain: ArrayBuffer;
  try {
    plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: bytes.slice(0, IV_BYTES) },
      await sealingKey(secret),
      bytes.slice(IV_BYTES),
    );
  } catch {
    return null;
  }
  const payload: unknown = JSON.parse(new TextDecoder().decode(plain));
  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof (payload as { k?: unknown }).k !== "string" ||
    typeof (payload as { e?: unknown }).e !== "number"
  ) {
    return null;
  }
  const { k, e } = payload as { k: string; e: number };
  return e > now ? k : null;
}
