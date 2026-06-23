/// <reference types="@cloudflare/workers-types" />

import type { ShareComment, ShareReaction, ShareRow } from './types';
import type { ShareDb } from './db-types';
import { memoryDb } from './db-memory';
import { createD1Db } from './db-d1';
import { getCloudflareEnv } from './cf-env';

// Resolve the active backend per call. The D1 binding is reachable via
// `getCloudflareEnv()` on Cloudflare Workers and under `next dev` (OpenNext
// maps bindings into the dev runtime); otherwise (non-Cloudflare runtime,
// unit tests) we fall through to the in-memory store.
//
// Resolving per call is required: the D1 binding is request-scoped, so a
// cached reference would leak data between requests.
async function resolveDb(): Promise<ShareDb> {
  const env = await getCloudflareEnv();
  return env?.DB ? createD1Db(env.DB) : memoryDb;
}

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

// Owner-name lookup for the public share page byline, against the better-auth
// `users` table. Returns null when the share is anonymous (user_id null on
// /api/init) or the user row was removed. Standalone rather than widening
// ShareRow so callers opt in to the extra D1 round trip.
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

// User-scoped aggregations (totalStorageForUser / activeArtifactCountForUser)
// live in lib/share/quota.ts because they span shares ∪ snaps for the combined
// account quota, which the share-only ShareDb backend can't compute.

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
