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
} from "@captureflow/quota";
import { getCloudflareEnv } from "./cf-env";

export { ACCOUNT_LIMITS };
export type { EffectiveLimits };

export async function getEffectiveLimitsForUser(
  userId: string,
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
  userId: string,
): Promise<number> {
  const env = await getCloudflareEnv();
  if (!env?.DB) return 0;
  return activeArtifactCountForUserD1(env.DB, userId);
}

export async function resolveUserWorkspaceId(
  userId: string,
): Promise<string | null> {
  const env = await getCloudflareEnv();
  if (!env?.DB) return null;
  const existing = await getPersonalWorkspaceForUser(env.DB, userId);
  if (existing) return existing.id;
  const profile = await env.DB.prepare(
    `SELECT name FROM users WHERE id = ?1 LIMIT 1`,
  )
    .bind(userId)
    .first<{ name: string | null }>();
  const workspace = await ensurePersonalWorkspace(
    env.DB,
    userId,
    profile?.name ?? null,
  );
  return workspace.id;
}

// Upload-time quota applies to the OWNER (Pro is per-user; team uploads draw down the owner's cap).
export async function getWorkspaceOwnerUserId(
  workspaceId: string,
): Promise<string | null> {
  const env = await getCloudflareEnv();
  if (!env?.DB) return null;
  const row = await getWorkspaceById(env.DB, workspaceId);
  return row?.owner_user_id ?? null;
}

export async function getWorkspaceForUpload(workspaceId: string) {
  const env = await getCloudflareEnv();
  if (!env?.DB) return null;
  return getWorkspaceById(env.DB, workspaceId);
}

export async function validateWorkspaceMembership(
  userId: string,
  workspaceId: string,
): Promise<string | null> {
  const env = await getCloudflareEnv();
  if (!env?.DB) return null;
  const ok = await isWorkspaceMember(env.DB, workspaceId, userId);
  return ok ? workspaceId : null;
}
