/// <reference types="@cloudflare/workers-types" />

import { getAppWebEnv } from './cf-env';

// Long-lived bearer tokens for the desktop app: the raw token is shown to the
// app exactly once and stored as SHA-256 server-side.

export type DeviceTokenRow = {
  id: string;
  userId: string;
  label: string | null;
  createdAt: number;
  lastUsedAt: number | null;
  revokedAt: number | null;
};

type D1Row = {
  id: string;
  user_id: string;
  token_hash: string;
  label: string | null;
  created_at: number;
  last_used_at: number | null;
  revoked_at: number | null;
};

async function getDb(): Promise<D1Database> {
  const env = await getAppWebEnv();
  if (!env?.DB) {
    throw new Error(
      'D1 binding (DB) not available. Run under OpenNext / Cloudflare.'
    );
  }
  return env.DB;
}

function generateRawToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashToken(raw: string): Promise<string> {
  const data = new TextEncoder().encode(raw);
  const buf = await crypto.subtle.digest('SHA-256', data);
  const arr = Array.from(new Uint8Array(buf));
  return arr.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export type IssuedDeviceToken = {
  id: string;
  rawToken: string;
};

export async function issueDeviceToken(
  userId: string,
  label: string | null
): Promise<IssuedDeviceToken> {
  const db = await getDb();
  const id = generateId();
  const rawToken = generateRawToken();
  const tokenHash = await hashToken(rawToken);
  const trimmedLabel =
    typeof label === 'string' && label.trim().length > 0
      ? label.trim().slice(0, 120)
      : null;
  await db
    .prepare(
      `INSERT INTO device_tokens (id, user_id, token_hash, label, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5)`
    )
    .bind(id, userId, tokenHash, trimmedLabel, Date.now())
    .run();
  return { id, rawToken };
}

// Side effect: bumps last_used_at for the dashboard's "Last seen" display.
export async function resolveDeviceToken(
  rawToken: string
): Promise<{ userId: string; id: string } | null> {
  if (typeof rawToken !== 'string' || rawToken.length < 32) return null;
  const db = await getDb();
  const tokenHash = await hashToken(rawToken);
  const row = await db
    .prepare(
      `SELECT id, user_id, revoked_at
         FROM device_tokens
         WHERE token_hash = ?1
         LIMIT 1`
    )
    .bind(tokenHash)
    .first<{ id: string; user_id: string; revoked_at: number | null }>();
  if (!row || row.revoked_at !== null) return null;
  await db
    .prepare(`UPDATE device_tokens SET last_used_at = ?2 WHERE id = ?1`)
    .bind(row.id, Date.now())
    .run();
  return { userId: row.user_id, id: row.id };
}

export async function listDeviceTokensForUser(
  userId: string
): Promise<DeviceTokenRow[]> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT id, user_id, token_hash, label, created_at, last_used_at, revoked_at
         FROM device_tokens
         WHERE user_id = ?1 AND revoked_at IS NULL
         ORDER BY last_used_at DESC NULLS LAST, created_at DESC`
    )
    .bind(userId)
    .all<D1Row>();
  return res.results.map((r) => ({
    id: r.id,
    userId: r.user_id,
    label: r.label,
    createdAt: r.created_at,
    lastUsedAt: r.last_used_at,
    revokedAt: r.revoked_at,
  }));
}

export async function revokeDeviceToken(
  userId: string,
  tokenId: string
): Promise<boolean> {
  const db = await getDb();
  const res = await db
    .prepare(
      `UPDATE device_tokens
         SET revoked_at = ?3
         WHERE id = ?1 AND user_id = ?2 AND revoked_at IS NULL`
    )
    .bind(tokenId, userId, Date.now())
    .run();
  return (res.meta?.changes ?? 0) > 0;
}
