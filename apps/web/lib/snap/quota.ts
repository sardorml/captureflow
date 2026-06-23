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
import { getCloudflareEnv } from './cf-env';

// Wraps @captureflow/quota with the env.DB lookup so route handlers can
// import these directly. Aggregates across shares ∪ snaps (single
// combined cap). The no-DB branch returns defaults so dev-mode probes
// (without OpenNext) don't 500.

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
  if (!env?.DB) return 0;
  return totalStorageForUserD1(env.DB, userId);
}

export async function activeArtifactCountForUser(
  userId: string
): Promise<number> {
  const env = await getCloudflareEnv();
  if (!env?.DB) return 0;
  return activeArtifactCountForUserD1(env.DB, userId);
}

// Resolve the user's personal workspace id for stamping onto a new
// snap. The signup hook normally pre-creates the row; fall through to
// ensurePersonalWorkspace as a defensive backstop for pre-migration
// accounts.
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

// Owner of a workspace — used at upload time to apply the OWNER's
// quota (Pro is per-user; team uploads draw down the owner's cap).
export async function getWorkspaceOwnerUserId(
  workspaceId: string
): Promise<string | null> {
  const env = await getCloudflareEnv();
  if (!env?.DB) return null;
  const row = await getWorkspaceById(env.DB, workspaceId);
  return row?.owner_user_id ?? null;
}

// Full workspace row for upload-time policy checks (owner + flags
// in one fetch).
export async function getWorkspaceForUpload(workspaceId: string) {
  const env = await getCloudflareEnv();
  if (!env?.DB) return null;
  return getWorkspaceById(env.DB, workspaceId);
}

// Validate a client-supplied workspace_id against the bearer user's
// memberships. Returns the id when the user is a member, null
// otherwise. See the share mirror of this helper for the
// "don't leak existence" rationale.
export async function validateWorkspaceMembership(
  userId: string,
  workspaceId: string
): Promise<string | null> {
  const env = await getCloudflareEnv();
  if (!env?.DB) return null;
  const ok = await isWorkspaceMember(env.DB, workspaceId, userId);
  return ok ? workspaceId : null;
}
