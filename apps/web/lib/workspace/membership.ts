/// <reference types="@cloudflare/workers-types" />

import {
  acceptInvite,
  createInvite,
  findInviteByToken,
  removeWorkspaceMember,
  revokeInvite,
  setCurrentWorkspaceId,
  updateWorkspaceMemberRole,
  type AssignableRole,
  type WorkspaceRow,
} from "@captureflow/quota";
import { syncWorkspaceSeats } from "@/lib/billing/seats";
import { sendWorkspaceInviteEmail } from "@/lib/email";

/*
 * Every change to who is in a workspace goes through here, so the seat count
 * billing sees and the workspace an account points at can never drift from
 * the membership rows. Seat sync is best effort by design and never blocks
 * the change.
 */

export type MembershipResult<T = object> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

export async function inviteToWorkspace(
  db: D1Database,
  args: {
    workspace: WorkspaceRow;
    email: string;
    role: AssignableRole;
    inviter: { userId: string; name: string | null; email: string };
    baseUrl: string;
  },
): Promise<MembershipResult<{ emailSent: boolean }>> {
  const result = await createInvite(db, {
    workspaceId: args.workspace.id,
    email: args.email,
    role: args.role,
    invitedByUserId: args.inviter.userId,
  });
  if (!result.ok) {
    return {
      ok: false,
      error: "That person is already a member of this workspace",
    };
  }
  const emailSent = await sendWorkspaceInviteEmail({
    to: args.email,
    inviterName: args.inviter.name,
    inviterEmail: args.inviter.email,
    workspaceName: args.workspace.name,
    role: args.role,
    acceptUrl: `${args.baseUrl}/invite/${result.plaintextToken}`,
  });
  return { ok: true, emailSent };
}

export type AcceptOutcome =
  | { ok: true; workspaceId: string; role: AssignableRole }
  | { ok: false; reason: "invalid" | "email-mismatch" | "already-member" };

// Joining also switches the account there, so the next upload and the next
// dashboard render land in the workspace the person just accepted.
export async function acceptWorkspaceInvite(
  db: D1Database,
  args: { token: string; userId: string; email: string },
): Promise<AcceptOutcome> {
  const invite = await findInviteByToken(db, args.token);
  if (!invite) return { ok: false, reason: "invalid" };
  if (invite.email.toLowerCase() !== args.email.toLowerCase()) {
    return { ok: false, reason: "email-mismatch" };
  }
  const result = await acceptInvite(db, {
    inviteId: invite.id,
    userId: args.userId,
  });
  if (!result.ok) {
    return {
      ok: false,
      reason: result.reason === "already_member" ? "already-member" : "invalid",
    };
  }
  await setCurrentWorkspaceId(db, args.userId, result.workspaceId);
  await syncWorkspaceSeats(result.workspaceId);
  return { ok: true, workspaceId: result.workspaceId, role: result.role };
}

export async function revokeWorkspaceInvite(
  db: D1Database,
  args: { workspaceId: string; inviteId: string },
): Promise<void> {
  await revokeInvite(db, args);
}

// Only the membership row goes; the person's recordings and screenshots stay
// in the workspace.
export async function removeMember(
  db: D1Database,
  args: { workspaceId: string; userId: string },
): Promise<MembershipResult> {
  const result = await removeWorkspaceMember(db, args.workspaceId, args.userId);
  if (!result.ok) {
    return {
      ok: false,
      error:
        result.reason === "cannot_remove_owner"
          ? "The owner can’t be removed"
          : "That person isn’t a member",
    };
  }
  await syncWorkspaceSeats(args.workspaceId);
  return { ok: true };
}

// Leaving clears the account's pointer first: a stale id would otherwise aim
// uploads at a workspace this person can no longer see.
export async function leaveWorkspace(
  db: D1Database,
  args: { workspaceId: string; userId: string },
): Promise<MembershipResult> {
  const result = await removeMember(db, args);
  if (result.ok) await setCurrentWorkspaceId(db, args.userId, null);
  return result;
}

export async function changeMemberRole(
  db: D1Database,
  args: { workspaceId: string; userId: string; role: AssignableRole },
): Promise<MembershipResult> {
  const result = await updateWorkspaceMemberRole(
    db,
    args.workspaceId,
    args.userId,
    args.role,
  );
  if (!result.ok) {
    return {
      ok: false,
      error:
        result.reason === "cannot_change_owner"
          ? "The owner’s role can’t change"
          : "That person isn’t a member",
    };
  }
  if (result.changed) await syncWorkspaceSeats(args.workspaceId);
  return { ok: true };
}
