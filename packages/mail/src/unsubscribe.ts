const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toBase64Url(
    await crypto.subtle.sign("HMAC", key, encoder.encode(message)),
  );
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// No expiry on purpose: an unsubscribe link in a years-old email still has to work.
export function unsubscribeToken(
  secret: string,
  email: string,
): Promise<string> {
  return hmac(secret, `unsubscribe:${normalizeEmail(email)}`);
}

export async function verifyUnsubscribeToken(
  secret: string,
  email: string,
  token: string,
): Promise<boolean> {
  const expected = await unsubscribeToken(secret, email);
  if (expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}

export async function unsubscribeUrl(
  baseUrl: string,
  secret: string,
  email: string,
): Promise<string> {
  const url = new URL("/unsubscribe", baseUrl);
  url.searchParams.set("e", normalizeEmail(email));
  url.searchParams.set("t", await unsubscribeToken(secret, email));
  return url.toString();
}
