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

// Thin wrapper around @captureflow/quota so routes get one place for the
// env-resolution + dev-fallback dance.
//
// D1 path: production + `next dev` under OpenNext's Cloudflare runtime.
// Memory path: tests / non-Cloudflare runners where env.DB is unreachable;
// falls back to shares-only in-memory aggregation since the snaps table
// doesn't exist there.

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

// Personal workspace id for stamping onto new shares at /api/init time.
// The signup hook auto-creates the row, so this usually hits an existing
// one. Defensive fallback (e.g. a user predating the workspaces migration):
// ensurePersonalWorkspace inline using the display name from the users
// table. Returns null only when env.DB is unavailable (tests).
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

// Owner of a workspace, used at upload time to apply the OWNER's quota:
// Pro is per-user, so team uploads draw down the owner's cap, not the
// uploader's. Returns null when env.DB is unavailable or no such workspace.
export async function getWorkspaceOwnerUserId(
  workspaceId: string
): Promise<string | null> {
  const env = await getCloudflareEnv();
  if (!env?.DB) return null;
  const row = await getWorkspaceById(env.DB, workspaceId);
  return row?.owner_user_id ?? null;
}

// Full workspace row (owner_user_id + policy flags). Lets the upload
// gates attribute storage and enforce public-link / member-upload
// policies in a single fetch.
export async function getWorkspaceForUpload(workspaceId: string) {
  const env = await getCloudflareEnv();
  if (!env?.DB) return null;
  return getWorkspaceById(env.DB, workspaceId);
}

// Resolve a client-supplied workspace_id against the bearer user's
// memberships. Returns the id if the user is a member, else null (caller
// falls back to personal). We don't distinguish "not a member" from "no
// such workspace" so clients can't probe other people's workspace ids.
export async function validateWorkspaceMembership(
  userId: string,
  workspaceId: string
): Promise<string | null> {
  const env = await getCloudflareEnv();
  if (!env?.DB) return null;
  const ok = await isWorkspaceMember(env.DB, workspaceId, userId);
  return ok ? workspaceId : null;
}
