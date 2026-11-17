/// <reference types="@cloudflare/workers-types" />

import {
  VOICEOVER_CHARS_PER_MINUTE,
  countUserRecordingsInWorkspace,
  getAgentUsage,
  getWorkspaceEntitlement,
  startOfMonthUtc,
} from "@captureflow/quota";
import type { AdminWorkspaceRow } from "./directory";

type Meter = { used: number; limit: number };

export type WorkspaceUsage = {
  workspaceId: string;
  workspaceName: string;
  recordings: Meter | null;
  agentMinutes: Meter | null;
  voiceoverMinutes: Meter | null;
};

/*
 * What a person has used of each cap in every workspace they belong to, with
 * the caps staff raised applied: their own recordings on the free plan, and
 * the agent recording and voiceover minutes the workspace shares this month.
 */
export async function listWorkspaceUsage(
  db: D1Database,
  userId: string,
  workspaces: AdminWorkspaceRow[],
  now: number,
): Promise<WorkspaceUsage[]> {
  return Promise.all(
    workspaces.map(async (w) => {
      const [entitlement, recordings, agent] = await Promise.all([
        getWorkspaceEntitlement(db, w.id, { userId }),
        countUserRecordingsInWorkspace(db, w.id, userId),
        getAgentUsage(db, w.id, startOfMonthUtc(now), now),
      ]);
      const meter = (used: number, limit: number | null) =>
        limit === null ? null : { used, limit };
      return {
        workspaceId: w.id,
        workspaceName: w.name,
        recordings: meter(recordings, entitlement.recordingsPerPerson),
        agentMinutes: meter(agent.agentMs / 60_000, entitlement.agentMinutes),
        voiceoverMinutes: entitlement.voiceoverMinutes
          ? meter(
              agent.narratedChars / VOICEOVER_CHARS_PER_MINUTE,
              entitlement.voiceoverMinutes,
            )
          : null,
      };
    }),
  );
}
