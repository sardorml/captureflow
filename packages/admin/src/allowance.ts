/// <reference types="@cloudflare/workers-types" />

import {
  countUserRecordingsInWorkspace,
  getWorkspaceEntitlement,
} from "@captureflow/quota";
import type { AdminWorkspaceRow } from "./directory";

export type RecordingAllowance = {
  workspaceId: string;
  workspaceName: string;
  used: number;
  limit: number;
};

// How much of the free plan's recording cap a person has used in each free
// workspace they belong to, with the caps staff raised applied.
export async function listRecordingAllowances(
  db: D1Database,
  userId: string,
  workspaces: AdminWorkspaceRow[],
): Promise<RecordingAllowance[]> {
  const rows = await Promise.all(
    workspaces
      .filter((w) => w.plan.tier === "free")
      .map(async (w) => {
        const [entitlement, used] = await Promise.all([
          getWorkspaceEntitlement(db, w.id, { userId }),
          countUserRecordingsInWorkspace(db, w.id, userId),
        ]);
        const limit = entitlement.recordingsPerPerson;
        return limit === null
          ? null
          : { workspaceId: w.id, workspaceName: w.name, used, limit };
      }),
  );
  return rows.filter((r): r is RecordingAllowance => r !== null);
}
