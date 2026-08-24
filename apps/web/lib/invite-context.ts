import {
  findInviteByToken,
  getWorkspaceById,
  listMembers,
} from "@captureflow/quota";
import { getAppWebEnv } from "./cf-env";

export type InviteContext = {
  email: string;
  workspaceName: string;
  inviterLabel: string;
};

/*
 * A signed-out visitor following an invite link is bounced to /login, which
 * would otherwise greet them with "Welcome back!" and no sign of why they are
 * there. Resolving the token here lets that page name who invited them, and
 * name the address the invitation is tied to — acceptance requires signing in
 * as that exact one, so guessing is a dead end.
 *
 * Returns null for anything that isn't a live invite. findInviteByToken already
 * rejects expired and accepted ones, so those fall back to the plain login page
 * and meet the "no longer valid" screen after signing in, which is where that
 * explanation belongs.
 */
export async function inviteContextFromNext(
  next: string,
): Promise<InviteContext | null> {
  const token = /^\/invite\/([^/?#]+)$/.exec(next)?.[1];
  if (!token) return null;

  const env = await getAppWebEnv();
  if (!env?.DB) return null;

  const invite = await findInviteByToken(env.DB, token);
  if (!invite) return null;

  const [workspace, members] = await Promise.all([
    getWorkspaceById(env.DB, invite.workspace_id),
    listMembers(env.DB, invite.workspace_id),
  ]);
  const inviter = members.find((m) => m.user_id === invite.invited_by_user_id);

  return {
    email: invite.email,
    workspaceName: workspace?.name ?? "a CaptureFlow workspace",
    inviterLabel: inviter?.name?.trim() || inviter?.email || "A teammate",
  };
}
