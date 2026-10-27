/// <reference types="@cloudflare/workers-types" />

import { redirect } from "next/navigation";
import {
  can,
  type WorkspaceAction,
  type WorkspaceRole,
  type WorkspaceRow,
} from "@captureflow/quota";
import { getAppWebEnv } from "@/lib/cf-env";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import { loadSession } from "@/lib/session-guard";

export type WorkspaceAccess = {
  db: D1Database;
  userId: string;
  userName: string | null;
  email: string;
  workspace: WorkspaceRow;
  role: WorkspaceRole;
};

export type AccessDenied = { ok: false; error: string };
export type AccessResult = ({ ok: true } & WorkspaceAccess) | AccessDenied;

/*
 * The gate every workspace server action stands behind. It re-reads the
 * session and the membership on each call, so a replayed or forged action
 * cannot lean on a UI that hid the control. Signed-out callers go to login;
 * a signed-in caller without the permission gets a message to show.
 */
export async function requireWorkspaceAccess(
  action: WorkspaceAction,
): Promise<AccessResult> {
  const session = await loadSession();
  if (!session) redirect("/login");
  const env = await getAppWebEnv();
  if (!env?.DB) return { ok: false, error: "Database unavailable" };
  const current = await resolveCurrentWorkspace(
    session.user.id,
    session.user.name ?? null,
  );
  if (!can(current.role, action)) {
    return { ok: false, error: DENIED[action] };
  }
  return {
    ok: true,
    db: env.DB,
    userId: session.user.id,
    userName: session.user.name ?? null,
    email: session.user.email,
    workspace: current.workspace,
    role: current.role,
  };
}

const DENIED: Record<WorkspaceAction, string> = {
  view: "You don’t have access to this workspace",
  comment: "Only members can comment here",
  record: "Viewers can’t record into this workspace",
  invite: "Only the workspace owner can invite people",
  "manage-members": "Only the workspace owner can change members",
  "manage-workspace": "Only the workspace owner can change this",
  leave: "The owner can’t leave their own workspace",
};
