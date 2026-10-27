/// <reference types="@cloudflare/workers-types" />

import {
  ACCOUNT_LIMITS,
  UNLIMITED_STORAGE_BYTES,
  getWorkspaceById,
  getWorkspaceEntitlement,
  isSelfHosted,
  resolveUploadWorkspace,
  totalStorageForWorkspace,
  type UploadTarget,
} from "@captureflow/quota";
import { getCloudflareEnv } from "./cf-env";

export { ACCOUNT_LIMITS };

/*
 * The storage a screenshot draws on: the workspace's pool, which the free
 * tier leaves uncapped since its recordings are bounded by count and size.
 * Without a database there is no pool to count against.
 */
export async function storageBudgetFor(row: {
  workspaceId: string | null;
}): Promise<{ used: number; limit: number }> {
  const env = await getCloudflareEnv();
  if (!env?.DB || !row.workspaceId) {
    return { used: 0, limit: UNLIMITED_STORAGE_BYTES };
  }
  const [entitlement, used] = await Promise.all([
    getWorkspaceEntitlement(env.DB, row.workspaceId, {
      selfHosted: isSelfHosted(env),
    }),
    totalStorageForWorkspace(env.DB, row.workspaceId),
  ]);
  return { used, limit: entitlement.storageBytes };
}

// Null without a database (memory mode), where uploads have no workspace.
export async function resolveUploadTarget(
  userId: string,
  requestedWorkspaceId: unknown,
): Promise<UploadTarget | null> {
  const env = await getCloudflareEnv();
  if (!env?.DB) return null;
  return resolveUploadWorkspace(env.DB, {
    userId,
    requestedWorkspaceId:
      typeof requestedWorkspaceId === "string" && requestedWorkspaceId
        ? requestedWorkspaceId
        : null,
  });
}

export async function getWorkspaceForUpload(workspaceId: string) {
  const env = await getCloudflareEnv();
  if (!env?.DB) return null;
  return getWorkspaceById(env.DB, workspaceId);
}
