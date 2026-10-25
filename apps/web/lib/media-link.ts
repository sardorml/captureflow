/*
 * Expiring links for non-public media. The storage key is sealed (AES-GCM)
 * into the link, never sent in the clear: the public CDN serves the same
 * bucket, so a key a viewer once saw would outlive any expiry.
 *
 * Links for the same key minted within the same hour come out identical, so
 * a page that re-renders (after an autosave, say) hands the player the URL it
 * already has and nothing reloads. The IV is a MAC of the payload: an equal
 * IV means an equal plaintext, which AES-GCM tolerates.
 */

export const MEDIA_LINK_TTL_MS = 6 * 60 * 60 * 1000;
export const MEDIA_LINK_MINT_WINDOW_MS = 60 * 60 * 1000;

const IV_BYTES = 12;
const encoder = new TextEncoder();

async function baseKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(secret), "HKDF", false, [
    "deriveKey",
  ]);
}

function hkdf(info: string): HkdfParams {
  return {
    name: "HKDF",
    hash: "SHA-256",
    salt: new Uint8Array(),
    info: encoder.encode(info),
  };
}

async function sealingKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    hkdf("captureflow media link v1"),
    await baseKey(secret),
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function ivKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    hkdf("captureflow media link iv v1"),
    await baseKey(secret),
    { name: "HMAC", hash: "SHA-256", length: 256 },
    false,
    ["sign"],
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
  const minted =
    Math.floor(now / MEDIA_LINK_MINT_WINDOW_MS) * MEDIA_LINK_MINT_WINDOW_MS;
  const payload = encoder.encode(
    JSON.stringify({ k: storageKey, e: minted + MEDIA_LINK_TTL_MS }),
  );
  const iv = new Uint8Array(
    await crypto.subtle.sign("HMAC", await ivKey(secret), payload),
  ).slice(0, IV_BYTES);
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
