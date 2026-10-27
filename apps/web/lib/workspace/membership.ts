/// <reference types="@cloudflare/workers-types" />

import {
  acceptInvite,
  addNotification,
  cancelMemberDowngrade,
  clearSeatRequest,
  createInvite,
  countWorkspaceSeats,
  getActiveWorkspaceSubscription,
  getSeatPlan,
  getWorkspaceById,
  getWorkspaceRole,
  seatPriceUsd,
  requestSeat,
  scheduleMemberDowngrade,
  findInviteByToken,
  findPendingInviteForEmail,
  removeWorkspaceMember,
  revokeInvite,
  setCurrentWorkspaceId,
  updateWorkspaceMemberRole,
  type AssignableRole,
  type WorkspaceInviteRow,
  type WorkspaceRow,
} from "@captureflow/quota";
import { syncWorkspaceSeats } from "@/lib/billing/seats";
import {
  sendMemberJoinedEmail,
  sendSeatRequestEmail,
  sendWorkspaceInviteEmail,
  sendWorkspaceJoinedEmail,
} from "@/lib/email";

/*
 * Every change to who is in a workspace goes through here, so the seat count
 * billing sees and the workspace an account points at can never drift from
 * the membership rows. Seat sync is best effort by design and never blocks
 * the change.
 */

// The feed is a courtesy: a failed write must never undo or block the change
// it describes, nor the email that goes with it.
async function notify(
  db: D1Database,
  args: Parameters<typeof addNotification>[1],
): Promise<void> {
  try {
    await addNotification(db, args);
  } catch (error) {
    console.warn("notification: not stored", { kind: args.kind, error });
  }
}

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
  args: { token: string; userId: string; email: string; baseUrl: string },
): Promise<AcceptOutcome> {
  const invite = await findInviteByToken(db, args.token);
  if (!invite) return { ok: false, reason: "invalid" };
  if (invite.email.toLowerCase() !== args.email.toLowerCase()) {
    return { ok: false, reason: "email-mismatch" };
  }
  return joinFromInvite(db, invite, args);
}

// The notification feed accepts by id: the account only sees its own invites.
export async function acceptWorkspaceInviteById(
  db: D1Database,
  args: { inviteId: string; userId: string; email: string; baseUrl: string },
): Promise<AcceptOutcome> {
  const invite = await findPendingInviteForEmail(db, args.inviteId, args.email);
  if (!invite) return { ok: false, reason: "invalid" };
  return joinFromInvite(db, invite, args);
}

async function joinFromInvite(
  db: D1Database,
  invite: WorkspaceInviteRow,
  args: { userId: string; baseUrl: string },
): Promise<AcceptOutcome> {
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
  await announceJoin(db, {
    workspaceId: result.workspaceId,
    userId: args.userId,
    role: result.role,
    baseUrl: args.baseUrl,
  });
  return { ok: true, workspaceId: result.workspaceId, role: result.role };
}

// Tells the owner who joined and what it does to the bill, and tells the
// person who joined what their role lets them do. Best effort, like all mail.
async function announceJoin(
  db: D1Database,
  args: {
    workspaceId: string;
    userId: string;
    role: AssignableRole;
    baseUrl: string;
  },
): Promise<void> {
  const workspace = await getWorkspaceById(db, args.workspaceId);
  if (!workspace) return;
  const userById = (id: string) =>
    db
      .prepare(`SELECT name, email FROM users WHERE id = ?1 LIMIT 1`)
      .bind(id)
      .first<{ name: string | null; email: string }>();
  const [joiner, owner, subscription, seats] = await Promise.all([
    userById(args.userId),
    userById(workspace.owner_user_id),
    getActiveWorkspaceSubscription(db, workspace.id),
    countWorkspaceSeats(db, workspace.id),
  ]);
  if (!joiner) return;
  if (workspace.owner_user_id !== args.userId) {
    await notify(db, {
      userId: workspace.owner_user_id,
      workspaceId: workspace.id,
      kind: "member_joined",
      actorUserId: args.userId,
      role: args.role,
      now: Date.now(),
    });
  }

  const sends: Promise<boolean>[] = [
    sendWorkspaceJoinedEmail({
      to: joiner.email,
      name: joiner.name,
      workspaceName: workspace.name,
      role: args.role,
      workspaceUrl: `${args.baseUrl}/recordings`,
    }),
  ];
  if (owner) {
    const paidSeats = Math.max(1, seats);
    sends.push(
      sendMemberJoinedEmail({
        to: owner.email,
        joinerName: joiner.name,
        joinerEmail: joiner.email,
        workspaceName: workspace.name,
        role: args.role,
        seat: subscription
          ? {
              planName: getSeatPlan(subscription.plan).name,
              seats: paidSeats,
              monthlyUsd: seatPriceUsd(
                paidSeats,
                subscription.cycle,
                subscription.plan,
              ),
              annual: subscription.cycle === "annual",
            }
          : null,
        membersUrl: `${args.baseUrl}/members`,
      }),
    );
  }
  await Promise.all(sends);
}

export async function revokeWorkspaceInvite(
  db: D1Database,
  args: { workspaceId: string; inviteId: string },
): Promise<void> {
  await revokeInvite(db, args);
}

// Only the membership row goes; the person's recordings and screenshots stay
// in the workspace. Without an actor it's the person leaving on their own.
export async function removeMember(
  db: D1Database,
  args: { workspaceId: string; userId: string; actorUserId?: string },
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
  if (args.actorUserId && args.actorUserId !== args.userId) {
    await notify(db, {
      userId: args.userId,
      workspaceId: args.workspaceId,
      kind: "removed",
      actorUserId: args.actorUserId,
      now: Date.now(),
    });
  }
  return { ok: true };
}

// Leaving clears the account's pointer first: a stale id would otherwise aim
// uploads at a workspace this person can no longer see.
export async function leaveWorkspace(
  db: D1Database,
  args: { workspaceId: string; userId: string },
): Promise<MembershipResult> {
  const result = await removeMember(db, {
    workspaceId: args.workspaceId,
    userId: args.userId,
  });
  if (result.ok) await setCurrentWorkspaceId(db, args.userId, null);
  return result;
}

/*
 * Moving a member to viewer in a paid workspace keeps their paid seat until
 * the period it was billed for ends; the daily cron applies it then. Making
 * someone a member settles any open seat request and any pending downgrade.
 */
export async function changeMemberRole(
  db: D1Database,
  args: {
    workspaceId: string;
    userId: string;
    role: AssignableRole;
    actorUserId: string;
  },
): Promise<MembershipResult<{ downgradeAt: number | null }>> {
  if (args.role === "viewer") {
    const [current, subscription] = await Promise.all([
      getWorkspaceRole(db, args.workspaceId, args.userId),
      getActiveWorkspaceSubscription(db, args.workspaceId),
    ]);
    const periodEnd = subscription?.current_period_end ?? null;
    if (current === "member" && periodEnd !== null) {
      const at = periodEnd * 1000;
      const scheduled = await scheduleMemberDowngrade(db, {
        workspaceId: args.workspaceId,
        userId: args.userId,
        at,
      });
      if (scheduled) {
        await notify(db, {
          userId: args.userId,
          workspaceId: args.workspaceId,
          kind: "downgrade_scheduled",
          actorUserId: args.actorUserId,
          role: "viewer",
          effectiveAt: at,
          now: Date.now(),
        });
      }
      return { ok: true, downgradeAt: at };
    }
  }

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
  if (args.role === "member") {
    await Promise.all([
      cancelMemberDowngrade(db, args.workspaceId, args.userId),
      clearSeatRequest(db, args.workspaceId, args.userId),
    ]);
  }
  if (result.changed) {
    await syncWorkspaceSeats(args.workspaceId);
    await notify(db, {
      userId: args.userId,
      workspaceId: args.workspaceId,
      kind: "role_changed",
      actorUserId: args.actorUserId,
      role: args.role,
      now: Date.now(),
    });
  }
  return { ok: true, downgradeAt: null };
}

// A viewer asks for a paid seat; the owner hears by email once per request.
export async function requestPaidSeat(
  db: D1Database,
  args: {
    workspace: WorkspaceRow;
    requester: { userId: string; name: string | null; email: string };
    baseUrl: string;
  },
): Promise<MembershipResult<{ alreadyRequested: boolean }>> {
  const { created } = await requestSeat(db, {
    workspaceId: args.workspace.id,
    userId: args.requester.userId,
    now: Date.now(),
  });
  if (!created) return { ok: true, alreadyRequested: true };
  await notify(db, {
    userId: args.workspace.owner_user_id,
    workspaceId: args.workspace.id,
    kind: "seat_requested",
    actorUserId: args.requester.userId,
    now: Date.now(),
  });
  const owner = await db
    .prepare(`SELECT name, email FROM users WHERE id = ?1 LIMIT 1`)
    .bind(args.workspace.owner_user_id)
    .first<{ name: string | null; email: string }>();
  if (owner) {
    await sendSeatRequestEmail({
      to: owner.email,
      ownerName: owner.name,
      requesterName: args.requester.name,
      requesterEmail: args.requester.email,
      workspaceName: args.workspace.name,
      manageUrl: `${args.baseUrl}/members`,
    });
  }
  return { ok: true, alreadyRequested: false };
}

export async function denySeatRequest(
  db: D1Database,
  args: { workspaceId: string; userId: string; actorUserId: string },
): Promise<void> {
  await clearSeatRequest(db, args.workspaceId, args.userId);
  await notify(db, {
    userId: args.userId,
    workspaceId: args.workspaceId,
    kind: "seat_denied",
    actorUserId: args.actorUserId,
    now: Date.now(),
  });
}
