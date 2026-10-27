/// <reference types="@cloudflare/workers-types" />

import {
  ACCOUNT_LIMITS,
  countUserRecordingsInWorkspace as countUserRecordingsInWorkspaceD1,
  getWorkspaceById,
  getWorkspaceEntitlement as getWorkspaceEntitlementD1,
  isSelfHosted,
  resolveUploadWorkspace,
  resolveWorkspaceEntitlement,
  totalStorageForWorkspace as totalStorageForWorkspaceD1,
  type UploadTarget,
  type WorkspaceEntitlement,
} from "@captureflow/quota";
import { getCloudflareEnv } from "./cf-env";
import { isDevDevice } from "./dev-allowlist";

export { ACCOUNT_LIMITS };

// Null without a database (tests, memory mode).
export async function getWorkspaceEntitlement(
  workspaceId: string,
): Promise<WorkspaceEntitlement | null> {
  const env = await getCloudflareEnv();
  if (!env?.DB) return null;
  return getWorkspaceEntitlementD1(env.DB, workspaceId, {
    selfHosted: isSelfHosted(env),
  });
}

export async function totalStorageForWorkspace(
  workspaceId: string,
): Promise<number> {
  const env = await getCloudflareEnv();
  if (!env?.DB) return 0;
  return totalStorageForWorkspaceD1(env.DB, workspaceId);
}

export async function countUserRecordingsInWorkspace(
  workspaceId: string,
  userId: string,
): Promise<number> {
  const env = await getCloudflareEnv();
  if (!env?.DB) return 0;
  return countUserRecordingsInWorkspaceD1(env.DB, workspaceId, userId);
}

export type UploadBudgetKind = "recording" | "storage";

/*
 * What bounds an upload and how much of that bound is spent. A free workspace
 * caps each recording's own bytes, screen and camera together; a paid one
 * charges the workspace's pooled storage.
 */
export type UploadBudget = {
  kind: UploadBudgetKind;
  used: number;
  limit: number;
};

export type UploadRow = {
  userId: string;
  workspaceId: string | null;
  sizeBytes: number;
  webcamSizeBytes: number;
};

export function budgetFromEntitlement(
  entitlement: WorkspaceEntitlement,
  row: Pick<UploadRow, "sizeBytes" | "webcamSizeBytes">,
  workspaceUsedBytes: number,
): UploadBudget {
  if (entitlement.maxRecordingBytes != null) {
    return {
      kind: "recording",
      used: row.sizeBytes + row.webcamSizeBytes,
      limit: entitlement.maxRecordingBytes,
    };
  }
  return {
    kind: "storage",
    used: workspaceUsedBytes,
    limit: entitlement.storageBytes,
  };
}

// A row with no workspace to charge is held to the free tier rather than left
// unmetered.
const FREE_ENTITLEMENT = resolveWorkspaceEntitlement({
  subscription: null,
  memberCount: 1,
});

export async function uploadBudgetFor(row: UploadRow): Promise<UploadBudget> {
  const entitlement = row.workspaceId
    ? await getWorkspaceEntitlement(row.workspaceId)
    : null;
  if (!entitlement || !row.workspaceId) {
    return budgetFromEntitlement(FREE_ENTITLEMENT, row, 0);
  }
  const used =
    entitlement.maxRecordingBytes != null
      ? 0
      : await totalStorageForWorkspace(row.workspaceId);
  return budgetFromEntitlement(entitlement, row, used);
}

export type UploadOverrun = "size_limit" | "storage_limit";

/*
 * Whether committing `addedBytes` for this artifact would overrun its budget,
 * and which budget: one place for the rule, because both finalize routes need
 * it. Anonymous rows have no account to charge, and a dev device is unmetered.
 */
export async function uploadOverrun(
  deviceId: string,
  row: { userId: string | null } & Omit<UploadRow, "userId">,
  addedBytes: number,
): Promise<UploadOverrun | null> {
  if (!row.userId) return null;
  if (await isDevDevice(deviceId)) return null;
  const budget = await uploadBudgetFor({ ...row, userId: row.userId });
  if (budget.used + addedBytes <= budget.limit) return null;
  return budget.kind === "recording" ? "size_limit" : "storage_limit";
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
