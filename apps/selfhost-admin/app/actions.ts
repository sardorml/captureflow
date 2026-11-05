"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminUser, revokeUserAccess } from "@captureflow/admin";
import { sendTransactional } from "@captureflow/mail";
import {
  getPersonalWorkspaceForUser,
  createInvite,
  getWorkspaceById,
  hydrateAssignableRole,
  removeWorkspaceMember,
  revokeInvite,
  setCurrentWorkspaceId,
  updateWorkspaceMemberRole,
} from "@captureflow/quota";
import {
  createInstanceUser,
  issuePasswordLink,
  listInstanceUserOptions,
  suspendInstanceUser,
  unsuspendInstanceUser,
  type InstanceUserOption,
  type PasswordLinkKind,
} from "@captureflow/selfhost/accounts";
import {
  addWorkspaceMembers,
  createTeamWorkspace,
  grantInstanceAdmin,
  listTeamWorkspaceOptions,
  markInstanceSetupCompleted,
  parseDomains,
  revokeInstanceAdmin,
  setInstanceSignupDomains,
  transferWorkspaceOwnership,
  type TeamWorkspaceOption,
} from "@captureflow/selfhost/instance";
import {
  cleanStrandedRecordings,
  deleteInstanceUser,
  deleteInstanceWorkspace,
  removeInstanceRecording,
} from "@captureflow/selfhost/library";
import { requireAdmin, type AdminAccess } from "@/lib/session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function texts(values: FormDataEntryValue[]): string[] {
  return [...new Set(values.map(text).filter(Boolean))].slice(0, 500);
}

export type CreateOptions = {
  mailConfigured: boolean;
  currentUserId: string;
  users: InstanceUserOption[];
  workspaces: TeamWorkspaceOption[];
};

// What the create dialogs pick from, fetched when one opens rather than with
// every page.
export async function loadCreateOptionsAction(): Promise<CreateOptions> {
  const access = await requireAdmin();
  const [users, workspaces] = await Promise.all([
    listInstanceUserOptions(access.DB),
    listTeamWorkspaceOptions(access.DB),
  ]);
  return {
    mailConfigured: access.MAIL_CONFIGURED,
    currentUserId: access.user.id,
    users,
    workspaces,
  };
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
  const ownerUserId = text(formData.get("ownerUserId")) || access.user.id;
  if (
    ownerUserId !== access.user.id &&
    !(await getAdminUser(access.DB, ownerUserId))
  ) {
    return { error: "That owner no longer has an account", id: null };
  }
  const id = await createTeamWorkspace(access.DB, { name, ownerUserId });
  await addWorkspaceMembers(access.DB, {
    workspaceId: id,
    userIds: texts(formData.getAll("memberId")),
    role: hydrateAssignableRole(formData.get("memberRole")),
  });
  revalidatePath("/", "layout");
  return { error: null, id };
}

// `link` is set only when the email could not be sent, for the administrator
// to pass on by hand.
export type UserLinkState = {
  error: string | null;
  email: string | null;
  link: string | null;
};

const NO_LINK = { email: null, link: null };

export async function createUserAction(
  _prev: UserLinkState,
  formData: FormData,
): Promise<UserLinkState> {
  const access = await requireAdmin();
  const name = text(formData.get("name"));
  const email = text(formData.get("email")).toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { error: "That doesn’t look like a valid email", ...NO_LINK };
  }
  if (name.length > 80) {
    return { error: "Keep the name under 80 characters", ...NO_LINK };
  }
  const result = await createInstanceUser(access.DB, { name, email });
  if (!result.ok) {
    return { error: "That address already has an account", ...NO_LINK };
  }
  if (formData.get("admin") === "on") {
    await grantInstanceAdmin(access.DB, result.userId);
  }
  const role = hydrateAssignableRole(formData.get("workspaceRole"));
  const workspaceIds = texts(formData.getAll("workspaceId"));
  for (const workspaceId of workspaceIds) {
    await addWorkspaceMembers(access.DB, {
      workspaceId,
      userIds: [result.userId],
      role,
    });
  }
  // They open on the workspace they were added to, not their personal one.
  if (workspaceIds[0]) {
    await setCurrentWorkspaceId(access.DB, result.userId, workspaceIds[0]);
  }
  const link = await sendPasswordLink(access, {
    userId: result.userId,
    email,
    kind: "new",
  });
  revalidatePath("/", "layout");
  return { error: null, email, link };
}

export async function passwordLinkAction(
  _prev: UserLinkState,
  formData: FormData,
): Promise<UserLinkState> {
  const access = await requireAdmin();
  const user = await getAdminUser(access.DB, text(formData.get("userId")));
  if (!user) return { error: "That account no longer exists", ...NO_LINK };
  const link = await sendPasswordLink(access, {
    userId: user.id,
    email: user.email,
    kind: "reset",
  });
  return { error: null, email: user.email, link };
}

// Returns the link only when no email went out: mail isn't set up, or the
// send failed.
async function sendPasswordLink(
  env: AdminAccess,
  args: { userId: string; email: string; kind: PasswordLinkKind },
): Promise<string | null> {
  const token = await issuePasswordLink(env.DB, args.userId, args.kind);
  const link = `${env.APP_URL}/set-password/${token}`;
  const isNew = args.kind === "new";
  const intro = isNew
    ? `${env.user.name || env.user.email} added you to CaptureFlow.`
    : "An administrator sent you a link to choose a new CaptureFlow password.";
  const lifetime = isNew ? "7 days" : "24 hours";
  const sent = await sendTransactional(
    {
      from: env.MAIL_FROM,
      binding: env.EMAIL,
      resendApiKey: env.RESEND_API_KEY,
    },
    {
      to: args.email,
      subject: isNew
        ? "Your CaptureFlow account is ready"
        : "Choose a new CaptureFlow password",
      text: [
        intro,
        "",
        `Open this link to set your password: ${link}`,
        "",
        `The link works once, for ${lifetime}.`,
      ].join("\n"),
      html: `<p>${escapeHtml(intro)}</p><p><a href="${link}">Set your password</a></p><p>The link works once, for ${lifetime}.</p>`,
    },
  );
  return env.MAIL_CONFIGURED && sent ? null : link;
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

export type InviteManyState = {
  error: string | null;
  links: { email: string; link: string }[];
};

// The setup wizard's version: several addresses at once, into the workspace
// it just made or the admin's own one.
export async function inviteManyAction(
  _prev: InviteManyState,
  formData: FormData,
): Promise<InviteManyState> {
  const access = await requireAdmin();
  const emails = [
    ...new Set(
      text(formData.get("emails"))
        .split(/[\s,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean),
    ),
  ].slice(0, 50);
  if (emails.length === 0)
    return { error: "Add at least one email", links: [] };
  const invalid = emails.filter((e) => !EMAIL_RE.test(e));
  if (invalid.length > 0) {
    return { error: `Not a valid email: ${invalid.join(", ")}`, links: [] };
  }
  const workspaceId = text(formData.get("workspaceId"));
  const workspace = workspaceId
    ? await getWorkspaceById(access.DB, workspaceId)
    : await getPersonalWorkspaceForUser(access.DB, access.user.id);
  if (!workspace)
    return { error: "That workspace no longer exists", links: [] };
  const role = hydrateAssignableRole(formData.get("role"));
  const links: InviteManyState["links"] = [];
  const skipped: string[] = [];
  for (const email of emails) {
    const result = await createInvite(access.DB, {
      workspaceId: workspace.id,
      email,
      role,
      invitedByUserId: access.user.id,
    });
    if (!result.ok) {
      skipped.push(email);
      continue;
    }
    const link = `${access.APP_URL}/invite/${result.plaintextToken}`;
    await emailInvite(access, { to: email, workspace: workspace.name, link });
    links.push({ email, link });
  }
  revalidatePath("/", "layout");
  return {
    error:
      skipped.length > 0 ? `Already a member: ${skipped.join(", ")}` : null,
    links,
  };
}

// Best effort through whatever mail the instance has (SMTP, Resend, or the
// container log): the link on the page is what the admin can rely on.
async function emailInvite(
  env: AdminAccess,
  args: { to: string; workspace: string; link: string },
): Promise<void> {
  const inviter = env.user.name || env.user.email;
  const text = [
    `${inviter} invited you to the ${args.workspace} workspace on CaptureFlow.`,
    "",
    `Open this link and sign up or log in with this address: ${args.link}`,
    "",
    "The link works for 7 days.",
  ].join("\n");
  await sendTransactional(
    {
      from: env.MAIL_FROM,
      binding: env.EMAIL,
      resendApiKey: env.RESEND_API_KEY,
    },
    {
      to: args.to,
      subject: `You're invited to ${args.workspace} on CaptureFlow`,
      text,
      html: `<p>${escapeHtml(inviter)} invited you to the <strong>${escapeHtml(args.workspace)}</strong> workspace on CaptureFlow.</p><p><a href="${args.link}">Accept the invitation</a> and sign up or log in with this address.</p><p>The link works for 7 days.</p>`,
    },
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

export async function suspendUserAction(
  _prev: DangerState,
  formData: FormData,
): Promise<DangerState> {
  const access = await requireAdmin();
  const error = await suspendInstanceUser(access.DB, {
    userId: text(formData.get("userId")),
    byUserId: access.user.id,
  });
  if (error) return { error };
  revalidatePath("/", "layout");
  return { error: null };
}

export async function unsuspendUserAction(formData: FormData): Promise<void> {
  const access = await requireAdmin();
  await unsuspendInstanceUser(access.DB, text(formData.get("userId")));
  revalidatePath("/", "layout");
}

export async function transferOwnershipAction(
  _prev: DangerState,
  formData: FormData,
): Promise<DangerState> {
  const access = await requireAdmin();
  const error = await transferWorkspaceOwnership(access.DB, {
    workspaceId: text(formData.get("workspaceId")),
    userId: text(formData.get("userId")),
  });
  if (error) return { error };
  revalidatePath("/", "layout");
  return { error: null };
}

export type SignupPolicyState = { error: string | null; saved: boolean };

// "invite" clears the domains; "domains" needs at least one real domain.
export async function setSignupPolicyAction(
  _prev: SignupPolicyState,
  formData: FormData,
): Promise<SignupPolicyState> {
  const access = await requireAdmin();
  const domains =
    formData.get("policy") === "domains"
      ? parseDomains(text(formData.get("domains")))
      : [];
  if (formData.get("policy") === "domains" && domains.length === 0) {
    return { error: "Enter at least one domain, like acme.com", saved: false };
  }
  await setInstanceSignupDomains(access.DB, domains);
  if (formData.get("finish") === "true") {
    await markInstanceSetupCompleted(access.DB);
  }
  revalidatePath("/", "layout");
  return { error: null, saved: true };
}

export type DangerState = { error: string | null };

export async function deleteRecordingAction(
  _prev: DangerState,
  formData: FormData,
): Promise<DangerState> {
  const access = await requireAdmin();
  const slug = text(formData.get("slug"));
  if (!slug) return { error: "Missing recording" };
  if (!(await removeInstanceRecording(access.DB, access.BUCKET, slug))) {
    return { error: "That recording is already gone." };
  }
  revalidatePath("/", "layout");
  return { error: null };
}

export async function deleteWorkspaceAction(
  _prev: DangerState,
  formData: FormData,
): Promise<DangerState> {
  const access = await requireAdmin();
  const error = await deleteInstanceWorkspace(
    access.DB,
    access.BUCKET,
    text(formData.get("workspaceId")),
  );
  if (error) return { error };
  revalidatePath("/", "layout");
  redirect("/workspaces");
}

export async function deleteUserAction(
  _prev: DangerState,
  formData: FormData,
): Promise<DangerState> {
  const access = await requireAdmin();
  const error = await deleteInstanceUser(access.DB, access.BUCKET, {
    userId: text(formData.get("userId")),
    byUserId: access.user.id,
  });
  if (error) return { error };
  revalidatePath("/", "layout");
  redirect("/users");
}

// Ends every session and desktop/extension token; the person signs in again.
export async function signOutUserAction(
  _prev: DangerState,
  formData: FormData,
): Promise<DangerState> {
  const access = await requireAdmin();
  const userId = text(formData.get("userId"));
  if (!userId) return { error: "Missing account" };
  await revokeUserAccess(access.DB, userId);
  revalidatePath("/", "layout");
  return { error: null };
}

export async function cleanStrandedAction(
  _prev: DangerState,
): Promise<DangerState> {
  const access = await requireAdmin();
  await cleanStrandedRecordings(access.DB, access.BUCKET);
  revalidatePath("/", "layout");
  return { error: null };
}
