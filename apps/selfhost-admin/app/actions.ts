"use server";

import { revalidatePath } from "next/cache";
import {
  createInvite,
  getWorkspaceById,
  hydrateAssignableRole,
  removeWorkspaceMember,
  revokeInvite,
  updateWorkspaceMemberRole,
} from "@captureflow/quota";
import {
  createTeamWorkspace,
  grantInstanceAdmin,
  revokeInstanceAdmin,
  setInstanceOpenSignup,
} from "@captureflow/selfhost/instance";
import { requireAdmin, type AdminAccess } from "@/lib/session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export type CreateWorkspaceState = { error: string | null; id: string | null };

export async function createWorkspaceAction(
  _prev: CreateWorkspaceState,
  formData: FormData,
): Promise<CreateWorkspaceState> {
  const access = await requireAdmin();
  const name = text(formData.get("name"));
  if (!name) return { error: "Enter a name", id: null };
  if (name.length > 80) {
    return { error: "Keep the name under 80 characters", id: null };
  }
  const id = await createTeamWorkspace(access.DB, {
    name,
    ownerUserId: access.user.id,
  });
  revalidatePath("/", "layout");
  return { error: null, id };
}

export type InviteState = {
  error: string | null;
  email: string | null;
  link: string | null;
};

export async function inviteAction(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const access = await requireAdmin();
  const email = text(formData.get("email"));
  if (!EMAIL_RE.test(email)) {
    return {
      error: "That doesn’t look like a valid email",
      email: null,
      link: null,
    };
  }
  const workspace = await getWorkspaceById(
    access.DB,
    text(formData.get("workspaceId")),
  );
  if (!workspace) {
    return {
      error: "That workspace no longer exists",
      email: null,
      link: null,
    };
  }
  const result = await createInvite(access.DB, {
    workspaceId: workspace.id,
    email,
    role: hydrateAssignableRole(formData.get("role")),
    invitedByUserId: access.user.id,
  });
  if (!result.ok) {
    return {
      error: "That person is already a member of this workspace",
      email: null,
      link: null,
    };
  }
  const link = `${access.APP_URL}/invite/${result.plaintextToken}`;
  await emailInvite(access, { to: email, workspace: workspace.name, link });
  revalidatePath("/", "layout");
  return { error: null, email, link };
}

// Best effort: the link on the page is what the admin can rely on.
async function emailInvite(
  env: AdminAccess,
  args: { to: string; workspace: string; link: string },
): Promise<void> {
  if (!env.EMAIL) return;
  try {
    await env.EMAIL.send({
      from: env.MAIL_FROM,
      to: args.to,
      subject: `You're invited to ${args.workspace} on CaptureFlow`,
      text: [
        `${env.user.name || env.user.email} invited you to the ${args.workspace} workspace.`,
        "",
        `Open this link and sign up or log in with this address: ${args.link}`,
        "",
        "The link works for 7 days.",
      ].join("\n"),
    });
  } catch (err) {
    console.warn("[admin] invite email not sent", err);
  }
}

export async function revokeInviteAction(formData: FormData): Promise<void> {
  const access = await requireAdmin();
  await revokeInvite(access.DB, {
    workspaceId: text(formData.get("workspaceId")),
    inviteId: text(formData.get("inviteId")),
  });
  revalidatePath("/", "layout");
}

export async function removeMemberAction(formData: FormData): Promise<void> {
  const access = await requireAdmin();
  await removeWorkspaceMember(
    access.DB,
    text(formData.get("workspaceId")),
    text(formData.get("userId")),
  );
  revalidatePath("/", "layout");
}

export async function changeRoleAction(formData: FormData): Promise<void> {
  const access = await requireAdmin();
  await updateWorkspaceMemberRole(
    access.DB,
    text(formData.get("workspaceId")),
    text(formData.get("userId")),
    hydrateAssignableRole(formData.get("role")),
  );
  revalidatePath("/", "layout");
}

export async function setAdminAction(formData: FormData): Promise<void> {
  const access = await requireAdmin();
  const userId = text(formData.get("userId"));
  if (formData.get("admin") === "true") {
    await grantInstanceAdmin(access.DB, userId);
  } else {
    await revokeInstanceAdmin(access.DB, userId);
  }
  revalidatePath("/", "layout");
}

export async function setOpenSignupAction(formData: FormData): Promise<void> {
  const access = await requireAdmin();
  await setInstanceOpenSignup(access.DB, formData.get("open") === "true");
  revalidatePath("/", "layout");
}
