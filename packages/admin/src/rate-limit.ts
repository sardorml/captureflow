/// <reference types="@cloudflare/workers-types" />

/*
 * Failure-counting throttle for the unauthenticated admin entry points. Keys are
 * caller-supplied scopes — an address and an account — and a lock on any one of
 * them refuses the attempt, so neither a single host spraying many accounts nor
 * many hosts targeting one account can run unbounded.
 *
 * Only failures are counted, and a success clears the keys, so a legitimate
 * operator who mistypes twice and then gets it right is never held back.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const LOCK_MS = 15 * 60 * 1000;

export type ThrottleVerdict =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export function loginScopeKeys(
  ip: string | null,
  email: string | null,
): string[] {
  const keys = [`ip:${ip ?? "unknown"}`];
  if (email) keys.push(`email:${email}`);
  return keys;
}

function placeholders(count: number): string {
  return Array.from({ length: count }, (_, i) => `?${i + 1}`).join(", ");
}

export async function checkThrottle(
  db: D1Database,
  keys: string[],
  now: number = Date.now(),
): Promise<ThrottleVerdict> {
  if (keys.length === 0) return { allowed: true };
  const row = await db
    .prepare(
      `SELECT MAX(locked_until) AS locked_until
         FROM admin_login_attempts
         WHERE id IN (${placeholders(keys.length)})`,
    )
    .bind(...keys)
    .first<{ locked_until: number | null }>();

  const lockedUntil = row?.locked_until ?? 0;
  if (lockedUntil <= now) return { allowed: true };
  return {
    allowed: false,
    retryAfterSeconds: Math.ceil((lockedUntil - now) / 1000),
  };
}

/*
 * The window restarts once it has elapsed, so an attempt every twenty minutes
 * never accumulates into a lock. Expressed as one upsert per key rather than a
 * read-then-write because two sign-ins racing on the same key would otherwise
 * both read the old count and each write back the same increment.
 */
export async function recordFailure(
  db: D1Database,
  keys: string[],
  now: number = Date.now(),
): Promise<void> {
  if (keys.length === 0) return;
  const windowStart = now - WINDOW_MS;
  const statement = db.prepare(
    `INSERT INTO admin_login_attempts (id, failures, first_failure_at, locked_until)
       VALUES (?1, 1, ?2, 0)
       ON CONFLICT(id) DO UPDATE SET
         failures = CASE WHEN first_failure_at < ?3 THEN 1 ELSE failures + 1 END,
         first_failure_at =
           CASE WHEN first_failure_at < ?3 THEN ?2 ELSE first_failure_at END,
         locked_until =
           CASE
             WHEN (CASE WHEN first_failure_at < ?3 THEN 1 ELSE failures + 1 END) >= ?4
               THEN ?5
             ELSE locked_until
           END`,
  );
  await db.batch(
    keys.map((key) =>
      statement.bind(key, now, windowStart, MAX_FAILURES, now + LOCK_MS),
    ),
  );
}

export async function clearThrottle(
  db: D1Database,
  keys: string[],
): Promise<void> {
  if (keys.length === 0) return;
  await db
    .prepare(
      `DELETE FROM admin_login_attempts WHERE id IN (${placeholders(keys.length)})`,
    )
    .bind(...keys)
    .run();
}

export function throttleMessage(retryAfterSeconds: number): string {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}
