"use server";

import { revalidatePath } from "next/cache";
import { declineInvite, markNotificationsRead } from "@captureflow/quota";
import { getAppBaseUrl } from "@/lib/app-base-url";
import { getAppWebEnv } from "@/lib/cf-env";
import { loadSession } from "@/lib/session-guard";
import { acceptWorkspaceInviteById } from "@/lib/workspace/membership";

const ACCEPT_ERRORS = {
  invalid: "This invitation has expired or was withdrawn",
  "email-mismatch": "This invitation is for a different email address",
  "already-member": "You’re already in this workspace",
} as const;

async function signedIn() {
  const [session, env] = await Promise.all([loadSession(), getAppWebEnv()]);
  if (!session || !env?.DB) return null;
  return { db: env.DB, user: session.user };
}

export async function markNotificationsReadAction(): Promise<void> {
  const auth = await signedIn();
  if (!auth) return;
  await markNotificationsRead(auth.db, auth.user.id, Date.now());
}

export async function acceptInviteFromFeedAction(
  inviteId: string,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await signedIn();
  if (!auth) return { ok: false, error: "Sign in to accept" };
  if (typeof inviteId !== "string" || !inviteId) {
    return { ok: false, error: ACCEPT_ERRORS.invalid };
  }
  const result = await acceptWorkspaceInviteById(auth.db, {
    inviteId,
    userId: auth.user.id,
    email: auth.user.email,
    baseUrl: await getAppBaseUrl(),
  });
  if (!result.ok) return { ok: false, error: ACCEPT_ERRORS[result.reason] };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function declineInviteFromFeedAction(
  inviteId: string,
): Promise<void> {
  const auth = await signedIn();
  if (!auth || typeof inviteId !== "string" || !inviteId) return;
  await declineInvite(auth.db, { inviteId, email: auth.user.email });
  revalidatePath("/", "layout");
}
