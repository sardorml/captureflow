/// <reference types="@cloudflare/workers-types" />

import type { ShareComment, ShareReaction, ShareRow } from './types';
import type { ShareDb } from './db-types';
import { memoryDb } from './db-memory';
import { createD1Db } from './db-d1';
import { getCloudflareEnv } from './cf-env';

// Resolve the active backend per call. On Cloudflare Workers (prod) and
// during `next dev` (OpenNext maps bindings into the dev runtime), the
// D1 binding is reachable via `getCloudflareEnv()`. When unreachable
// (e.g. running under a non-Cloudflare runtime, or in unit tests), we
// fall through to the in-memory store.
//
// Caching across calls is unsafe — D1 binding is request-scoped, so a
// stale reference would leak data between requests. The cost of
// re-resolving is one property lookup.
async function resolveDb(): Promise<ShareDb> {
  const env = await getCloudflareEnv();
  return env?.DB ? createD1Db(env.DB) : memoryDb;
}

// Public API — same signatures the route handlers already call.

export async function insertShare(row: ShareRow): Promise<void> {
  return (await resolveDb()).insertShare(row);
}

export async function getShare(slug: string): Promise<ShareRow | null> {
  return (await resolveDb()).getShare(slug);
}

export async function updateShare(
  slug: string,
  patch: Partial<ShareRow>
): Promise<ShareRow | null> {
  return (await resolveDb()).updateShare(slug, patch);
}

export async function deleteShare(slug: string): Promise<boolean> {
  return (await resolveDb()).deleteShare(slug);
}

export async function listSharesForDevice(
  deviceId: string
): Promise<ShareRow[]> {
  return (await resolveDb()).listSharesForDevice(deviceId);
}

export async function listSharesForUser(userId: string): Promise<ShareRow[]> {
  return (await resolveDb()).listSharesForUser(userId);
}

// Owner-name lookup for the public share page byline. Joins to the
// better-auth `users` table by id. Returns null when the share is
// anonymous (user_id was null on /api/init) or the user row was
// removed since the share was uploaded. Kept as a standalone
// function instead of widening ShareRow so the metadata + page
// renderers can opt in to the extra D1 round trip without changing
// every callsite.
export async function getOwnerName(userId: string): Promise<string | null> {
  const env = await getCloudflareEnv();
  if (!env?.DB) return null;
  const r = await env.DB.prepare(`SELECT name FROM users WHERE id = ?1 LIMIT 1`)
    .bind(userId)
    .first<{ name: string }>();
  return r?.name ?? null;
}

export async function totalStorageForDevice(deviceId: string): Promise<number> {
  return (await resolveDb()).totalStorageForDevice(deviceId);
}

export async function activeShareCountForDevice(
  deviceId: string
): Promise<number> {
  return (await resolveDb()).activeShareCountForDevice(deviceId);
}

// User-scoped aggregations (totalStorageForUser /
// activeArtifactCountForUser) now live in lib/share/quota.ts, which
// resolves the @captureflow/quota helpers against env.DB or the in-memory
// fallback. They aggregate across shares ∪ snaps for the combined
// account quota, so the share-only ShareDb backend no longer owns
// them.

export async function bumpLastViewed(slug: string): Promise<void> {
  return (await resolveDb()).bumpLastViewed(slug);
}

export async function addReaction(input: {
  slug: string;
  emoji: string;
  timestampMs: number;
  userId: string | null;
  userName: string | null;
}): Promise<ShareReaction> {
  return (await resolveDb()).addReaction(input);
}

export async function listReactions(slug: string): Promise<ShareReaction[]> {
  return (await resolveDb()).listReactions(slug);
}

export async function countReactions(slug: string): Promise<number> {
  return (await resolveDb()).countReactions(slug);
}

export async function addComment(input: {
  slug: string;
  userId: string;
  userName: string;
  body: string;
  timestampMs: number | null;
}): Promise<ShareComment> {
  return (await resolveDb()).addComment(input);
}

export async function listComments(slug: string): Promise<ShareComment[]> {
  return (await resolveDb()).listComments(slug);
}

export async function countComments(slug: string): Promise<number> {
  return (await resolveDb()).countComments(slug);
}

export async function getComment(id: number) {
  return (await resolveDb()).getComment(id);
}

export async function deleteComment(id: number): Promise<boolean> {
  return (await resolveDb()).deleteComment(id);
}
