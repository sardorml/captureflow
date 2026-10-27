"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hydrateAssignableRole } from "@captureflow/quota";
import { getAppWebEnv } from "@/lib/cf-env";
import { getAppBaseUrl } from "@/lib/app-base-url";
import { loadSession } from "@/lib/session-guard";
import { requireWorkspaceAccess } from "@/lib/workspace/access";
import {
  acceptWorkspaceInvite,
  changeMemberRole,
  inviteToWorkspace,
  leaveWorkspace,
  removeMember,
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

  const email = text(formData.get("email"));
  if (!email) return { error: "Enter an email address", ok: null };
  // Loose check suffices: the recipient must sign in with this exact address to accept, so a typo just no-ops.
  if (!EMAIL_RE.test(email)) {
    return { error: "That doesn’t look like a valid email", ok: null };
  }
  if (email.toLowerCase() === access.email.toLowerCase()) {
    return { error: "You’re already in your own workspace", ok: null };
  }

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
  });
  if (!result.ok) return { error: result.error, ok: null };

  revalidatePath("/members");
  if (!result.emailSent) {
    return {
      error:
        "Invitation created but email delivery failed. Copy the link from the pending list.",
      ok: null,
    };
  }
  return { error: null, ok: `Invitation sent to ${email}` };
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
  await removeMember(access.db, { workspaceId: access.workspace.id, userId });
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
  });
  // The upgrade dialog in the top bar and sidebar shows the seats too.
  revalidatePath("/", "layout");
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
  });
  if (!result.ok) redirect(`/recordings?invite=${result.reason}`);

  revalidatePath("/", "layout");
  redirect("/members?invite=accepted");
}
