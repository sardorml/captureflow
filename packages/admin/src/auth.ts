/*
 * Operator credentials, deliberately unrelated to the product's own accounts.
 * Admins live in `admin_users`; the product's `users` table grants nothing here
 * and an admin row grants nothing there.
 *
 * The session is a self-contained signed cookie rather than a database row. It
 * carries only the admin id — role and status are re-read from the row on every
 * request, so a demotion or removal takes effect immediately instead of when the
 * cookie happens to expire.
 */

export const ADMIN_COOKIE = "cf_admin_session";

/*
 * Iterations are stored inside the hash so this can be raised later without
 * invalidating existing passwords. Kept moderate because it runs inside a
 * Worker request, where CPU time is metered.
 */
const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;
const OPAQUE_TOKEN_BYTES = 32;

const encoder = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(text: string): Uint8Array {
  const pad = text.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(pad + "=".repeat((4 - (pad.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmac(secret: string, payload: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return new Uint8Array(sig);
}

// Constant-time: a length-independent early return leaks the secret one request
// at a time.
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

async function derive(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    key,
    KEY_BITS,
  );
  return new Uint8Array(bits);
}

// Encoded as `pbkdf2$sha256$<iterations>$<salt>$<hash>`, both parts base64url.
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derive(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$sha256$${PBKDF2_ITERATIONS}$${b64url(salt)}$${b64url(hash)}`;
}

export async function verifyPassword(
  password: string,
  stored: string | undefined,
): Promise<boolean> {
  if (!stored) return false;
  const parts = stored.split("$");
  if (parts.length !== 5 || parts[0] !== "pbkdf2" || parts[1] !== "sha256") {
    return false;
  }
  const iterations = Number(parts[2]);
  if (!Number.isInteger(iterations) || iterations < 1) return false;
  try {
    const salt = fromB64url(parts[3]!);
    const expected = fromB64url(parts[4]!);
    return timingSafeEqual(await derive(password, salt, iterations), expected);
  } catch {
    return false;
  }
}

/*
 * A syntactically valid hash of a value nobody holds. Verifying against it costs
 * the same PBKDF2 work as a real row, so an address that is not an admin takes
 * as long to reject as one that is — otherwise the clock answers the question
 * the single "wrong email or password" message refuses to.
 */
const DECOY_HASH = `pbkdf2$sha256$${PBKDF2_ITERATIONS}$${b64url(
  new Uint8Array(SALT_BYTES),
)}$${b64url(new Uint8Array(KEY_BITS / 8))}`;

export async function verifyPasswordOrDecoy(
  password: string,
  stored: string | undefined,
): Promise<boolean> {
  if (stored) return verifyPassword(password, stored);
  await verifyPassword(password, DECOY_HASH);
  return false;
}

/*
 * Guards the one-time first-run claim. Without it the first request to reach a
 * fresh deployment could take ownership of the panel, so the operator proves
 * they control the environment before any admin exists.
 *
 * Both sides are trimmed: this token is pasted by hand from a terminal or a
 * secrets manager, and a trailing space is otherwise indistinguishable from a
 * wrong token.
 */
export async function verifySetupToken(
  supplied: string,
  expected: string | undefined,
): Promise<boolean> {
  if (!expected?.trim()) return false;
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(supplied.trim())),
    crypto.subtle.digest("SHA-256", encoder.encode(expected.trim())),
  ]);
  return timingSafeEqual(new Uint8Array(a), new Uint8Array(b));
}

export async function issueSession(
  secret: string,
  adminId: string,
  ttlSeconds: number,
): Promise<string> {
  const payload = `${adminId}.${Date.now() + ttlSeconds * 1000}`;
  return `${payload}.${b64url(await hmac(secret, payload))}`;
}

export async function verifySession(
  secret: string | undefined,
  cookie: string | undefined,
): Promise<string | null> {
  if (!secret || !cookie) return null;
  const sigAt = cookie.lastIndexOf(".");
  if (sigAt < 1) return null;
  const payload = cookie.slice(0, sigAt);
  const expiresAt = payload.lastIndexOf(".");
  if (expiresAt < 1) return null;

  const expires = Number(payload.slice(expiresAt + 1));
  if (!Number.isFinite(expires) || expires < Date.now()) return null;

  let supplied: Uint8Array;
  try {
    supplied = fromB64url(cookie.slice(sigAt + 1));
  } catch {
    return null;
  }
  if (!timingSafeEqual(await hmac(secret, payload), supplied)) return null;
  return payload.slice(0, expiresAt);
}

// Opaque bearer tokens: invite links and first-run setup claims.
export function createToken(): string {
  return b64url(crypto.getRandomValues(new Uint8Array(OPAQUE_TOKEN_BYTES)));
}

// Only the digest is persisted, so a leaked database cannot be replayed to
// claim a pending invite or an unclaimed deployment.
export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  return hex(new Uint8Array(digest));
}
