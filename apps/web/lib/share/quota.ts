/// <reference types="@cloudflare/workers-types" />

import {
  ACCOUNT_LIMITS,
  activeArtifactCountForUser as activeArtifactCountForUserD1,
  ensurePersonalWorkspace,
  type EffectiveLimits,
  getEffectiveLimitsForUser as getEffectiveLimitsForUserD1,
  getPersonalWorkspaceForUser,
  getWorkspaceById,
  isWorkspaceMember,
  totalStorageForUser as totalStorageForUserD1,
} from '@captureflow/quota';
import {
  memoryActiveArtifactCountForUser,
  memoryTotalStorageForUser,
} from './db-memory';
import { getCloudflareEnv } from './cf-env';

// Local thin wrapper around @captureflow/quota. Routes import quota fns +
// constants from here so the request handler doesn't have to
// re-implement the env-resolution + dev-fallback dance every time.
//
// D1 path: production + `next dev` with OpenNext's Cloudflare runtime
// (always the case in this repo). Memory path: tests / non-Cloudflare
// runners where env.DB is unreachable — falls back to the shares-only
// in-memory aggregation since the snaps table doesn't exist there.

export { ACCOUNT_LIMITS };
export type { EffectiveLimits };

export async function getEffectiveLimitsForUser(
  userId: string
): Promise<EffectiveLimits> {
  const env = await getCloudflareEnv();
  if (!env?.DB) {
    return {
      storageBytes: ACCOUNT_LIMITS.totalStorageBytes,
      activeArtifacts: ACCOUNT_LIMITS.activeArtifactsPerAccount,
      perShareDurationMs: ACCOUNT_LIMITS.perShareDurationMs,
      proSubscriptionActive: false,
    };
  }
  return getEffectiveLimitsForUserD1(env.DB, userId);
}

export async function totalStorageForUser(userId: string): Promise<number> {
  const env = await getCloudflareEnv();
  if (!env?.DB) return memoryTotalStorageForUser(userId);
  return totalStorageForUserD1(env.DB, userId);
}

export async function activeArtifactCountForUser(
  userId: string
): Promise<number> {
  const env = await getCloudflareEnv();
  if (!env?.DB) return memoryActiveArtifactCountForUser(userId);
  return activeArtifactCountForUserD1(env.DB, userId);
}

// Look up the user's personal workspace id for stamping onto new shares
// at /api/init time. The signup hook auto-creates the row, so this
// should almost always hit a cached row. As a defensive
// fallback (e.g. a user signed up before the workspaces migration ran),
// we ensurePersonalWorkspace inline using the user's display name from
// the users table. Returns null only when env.DB is unavailable (tests)
// or the lookup fails entirely.
export async function resolveUserWorkspaceId(
  userId: string
): Promise<string | null> {
  const env = await getCloudflareEnv();
  if (!env?.DB) return null;
  const existing = await getPersonalWorkspaceForUser(env.DB, userId);
  if (existing) return existing.id;

  const profile = await env.DB.prepare(
    `SELECT name FROM users WHERE id = ?1 LIMIT 1`
  )
    .bind(userId)
    .first<{ name: string | null }>();
  const workspace = await ensurePersonalWorkspace(
    env.DB,
    userId,
    profile?.name ?? null
  );
  return workspace.id;
}

// Look up the owner of a workspace — used at upload time to apply
// the OWNER's quota (Pro is per-user; team uploads draw down the
// owner's cap, not the uploader's). Returns null when env.DB is
// unavailable or the workspace doesn't exist.
export async function getWorkspaceOwnerUserId(
  workspaceId: string
): Promise<string | null> {
  const env = await getCloudflareEnv();
  if (!env?.DB) return null;
  const row = await getWorkspaceById(env.DB, workspaceId);
  return row?.owner_user_id ?? null;
}

// Full workspace row — owner_user_id + policy flags. Used by the
// upload gates so they can both attribute storage and enforce the
// workspace's public-link / member-upload policies in one fetch.
export async function getWorkspaceForUpload(workspaceId: string) {
  const env = await getCloudflareEnv();
  if (!env?.DB) return null;
  return getWorkspaceById(env.DB, workspaceId);
}

// Resolve a client-supplied workspace_id against the bearer user's
// memberships. Returns the validated id if the user is a member,
// `null` if they aren't (caller falls back to personal), and
// `'invalid'` only when the workspace id format is structurally bad —
// we don't distinguish "not a member" from "no such workspace" so the
// client can't probe other people's workspace ids.
export async function validateWorkspaceMembership(
  userId: string,
  workspaceId: string
): Promise<string | null> {
  const env = await getCloudflareEnv();
  if (!env?.DB) return null;
  const ok = await isWorkspaceMember(env.DB, workspaceId, userId);
  return ok ? workspaceId : null;
}
