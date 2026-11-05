"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hydrateAssignableRole } from "@captureflow/quota";
import { getAppWebEnv } from "@/lib/cf-env";
import { getAppBaseUrl } from "@/lib/app-base-url";
import { getAppI18n } from "@/lib/i18n/app/server";
import { fmt } from "@/lib/i18n/format";
import { selfHostHooks } from "@/lib/selfhost";
import { loadSession } from "@/lib/session-guard";
import { requireWorkspaceAccess } from "@/lib/workspace/access";
import {
  acceptWorkspaceInvite,
  changeMemberRole,
  denySeatRequest,
  inviteToWorkspace,
  leaveWorkspace,
  removeMember,
  requestPaidSeat,
  revokeWorkspaceInvite,
} from "@/lib/workspace/membership";

// Thin on purpose: each action parses its form, passes the access gate for
// one permission and hands off to the membership service.

type FormState = {
  error: string | null;
  ok: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function inviteMemberAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const access = await requireWorkspaceAccess("invite");
  if (!access.ok) return { error: access.error, ok: null };
  const copy = (await getAppI18n()).messages.members.actions;

  const email = text(formData.get("email"));
  if (!email) return { error: copy.emailRequired, ok: null };
  // Loose check suffices: the recipient must sign in with this exact address to accept, so a typo just no-ops.
  if (!EMAIL_RE.test(email)) {
    return { error: copy.emailInvalid, ok: null };
  }
  if (email.toLowerCase() === access.email.toLowerCase()) {
    return { error: copy.ownWorkspace, ok: null };
  }
  const refusal = await (
    await selfHostHooks()
  )?.inviteRefusal(access.userId, email);
  if (refusal) return { error: refusal, ok: null };

  const result = await inviteToWorkspace(access.db, {
    workspace: access.workspace,
    email,
    role: hydrateAssignableRole(formData.get("role")),
    inviter: {
      userId: access.userId,
      name: access.userName,
      email: access.email,
    },
    baseUrl: await getAppBaseUrl(),
    alreadyMemberError: copy.alreadyMember,
  });
  if (!result.ok) return { error: result.error, ok: null };

  revalidatePath("/members");
  if (!result.emailSent) {
    return { error: copy.emailNotSent, ok: null };
  }
  return { error: null, ok: fmt(copy.invitationSent, { email }) };
}

export async function revokeInviteAction(formData: FormData): Promise<void> {
  const access = await requireWorkspaceAccess("manage-members");
  if (!access.ok) return;
  const inviteId = text(formData.get("inviteId"));
  if (!inviteId) return;
  await revokeWorkspaceInvite(access.db, {
    inviteId,
    workspaceId: access.workspace.id,
  });
  revalidatePath("/members");
}

export async function removeMemberAction(formData: FormData): Promise<void> {
  const access = await requireWorkspaceAccess("manage-members");
  if (!access.ok) return;
  const userId = text(formData.get("userId"));
  if (!userId || userId === access.userId) return;
  await removeMember(access.db, {
    workspaceId: access.workspace.id,
    userId,
    actorUserId: access.userId,
  });
  revalidatePath("/members");
}

export async function changeMemberRoleAction(
  formData: FormData,
): Promise<void> {
  const access = await requireWorkspaceAccess("manage-members");
  if (!access.ok) return;
  const userId = text(formData.get("userId"));
  if (!userId || userId === access.userId) return;
  await changeMemberRole(access.db, {
    workspaceId: access.workspace.id,
    userId,
    role: hydrateAssignableRole(formData.get("role")),
    actorUserId: access.userId,
  });
  // The upgrade dialog in the top bar and sidebar shows the seats too.
  revalidatePath("/", "layout");
}

export async function requestPaidSeatAction(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const access = await requireWorkspaceAccess("view");
  if (!access.ok) return { ok: false, error: access.error };
  if (access.role !== "viewer") {
    const { messages: m } = await getAppI18n();
    return { ok: false, error: m.members.actions.alreadyRecording };
  }
  const result = await requestPaidSeat(access.db, {
    workspace: access.workspace,
    requester: {
      userId: access.userId,
      name: access.userName,
      email: access.email,
    },
    baseUrl: await getAppBaseUrl(),
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function denySeatRequestAction(formData: FormData): Promise<void> {
  const access = await requireWorkspaceAccess("manage-members");
  if (!access.ok) return;
  const userId = text(formData.get("userId"));
  if (!userId) return;
  await denySeatRequest(access.db, {
    workspaceId: access.workspace.id,
    userId,
    actorUserId: access.userId,
  });
  revalidatePath("/members");
}

export async function leaveWorkspaceAction(): Promise<void> {
  const access = await requireWorkspaceAccess("leave");
  if (!access.ok) return;
  await leaveWorkspace(access.db, {
    workspaceId: access.workspace.id,
    userId: access.userId,
  });
  revalidatePath("/", "layout");
  redirect("/recordings");
}

// Accepting needs a session, not a workspace: the invite names the workspace.
export async function acceptInviteAction(formData: FormData): Promise<void> {
  const session = await loadSession();
  if (!session) redirect("/login");
  const env = await getAppWebEnv();
  if (!env?.DB) redirect("/recordings?invite=db-unavailable");

  const token = text(formData.get("token"));
  if (!token) redirect("/recordings?invite=invalid");

  const result = await acceptWorkspaceInvite(env.DB, {
    token,
    userId: session.user.id,
    email: session.user.email,
    baseUrl: await getAppBaseUrl(),
  });
  if (!result.ok) redirect(`/recordings?invite=${result.reason}`);

  revalidatePath("/", "layout");
  redirect("/members?invite=accepted");
}
