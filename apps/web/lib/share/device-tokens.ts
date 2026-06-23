/// <reference types="@cloudflare/workers-types" />

import { getCloudflareEnv } from './cf-env';

// Hashing must match the desktop app's token issuer: SHA-256 of the raw token
// bytes, hex-encoded.
async function hashToken(raw: string): Promise<string> {
  const data = new TextEncoder().encode(raw);
  const buf = await crypto.subtle.digest('SHA-256', data);
  const arr = Array.from(new Uint8Array(buf));
  return arr.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function resolveDeviceTokenToUser(
  rawToken: string
): Promise<string | null> {
  if (typeof rawToken !== 'string' || rawToken.length < 32) return null;
  const env = await getCloudflareEnv();
  if (!env?.DB) return null;
  const tokenHash = await hashToken(rawToken);
  const row = await env.DB.prepare(
    `SELECT id, user_id, revoked_at
       FROM device_tokens
       WHERE token_hash = ?1
       LIMIT 1`
  )
    .bind(tokenHash)
    .first<{ id: string; user_id: string; revoked_at: number | null }>();
  if (!row || row.revoked_at !== null) return null;
  // Fire-and-forget bump: a failed best-effort write must not fail auth.
  env.DB.prepare(`UPDATE device_tokens SET last_used_at = ?2 WHERE id = ?1`)
    .bind(row.id, Date.now())
    .run()
    .catch(() => {});
  return row.user_id;
}
