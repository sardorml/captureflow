"use server";

/// <reference types="@cloudflare/workers-types" />

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  ADMIN_COOKIE,
  type AdminRole,
  MIN_PASSWORD_LENGTH,
  claimInvite,
  clearSetupTokens,
  consumeSetupToken,
  countAdmins,
  createAdmin,
  createInvite,
  createSetupToken,
  createToken,
  deleteAdmin,
  deleteInvite,
  getAdmin,
  getAdminCredentials,
  getPendingInvite,
  hashPassword,
  hashToken,
  hydrateAdminId,
  hydrateEmail,
  hydrateInviteToken,
  hydratePassword,
  hydrateQuotaInput,
  hydrateRole,
  hydrateUserId,
  issueSession,
  setAdminStatus,
  setUserQuota,
  touchAdminLogin,
  updateAdminRole,
  verifyPassword,
  verifySetupToken,
  writeAudit,
} from "@captureflow/admin";
import { getAdminEnv, sessionTtlSeconds } from "@/lib/env";
import { requirePermission } from "@/lib/guard";
import { inviteUrl, sendInviteEmail } from "@/lib/email";

/*
 * Actions can be replayed directly, so each re-verifies rather than trusting
 * that the page which rendered the form was gated.
 *
 * Failures come back as state for the form to render, never as a redirect
 * carrying an `?error=` param: that put the reason in the URL and the browser
 * history, and re-rendering the page wiped whatever had been typed. Only a
 * successful mutation navigates.
 */

export type FormState = { error: string | null };
export type MintState = FormState & { token: string | null; logged: boolean };
export type InviteState = FormState & { link: string | null; sent: boolean };

const INVITE_TTL_MS = 7 * 24 * 3600 * 1000;
const SETUP_TOKEN_TTL_MS = 30 * 60 * 1000;
const SHORT_PASSWORD = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
const NO_DB = "No database binding on this deployment.";
const NO_SECRET = "ADMIN_SESSION_SECRET is not set on this deployment.";
const STALE_INVITE = "This invite has expired or has already been used.";

async function startSession(adminId: string): Promise<void> {
  const env = await getAdminEnv();
  if (!env?.ADMIN_SESSION_SECRET) return;
  const ttl = sessionTtlSeconds(env);
  (await cookies()).set(
    ADMIN_COOKIE,
    await issueSession(env.ADMIN_SESSION_SECRET, adminId, ttl),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ttl,
    },
  );
}

/*
 * First-run claim. Gated on the deployment having no admins at all AND on the
 * operator producing a setup token — without one, whoever reached a fresh
 * deployment first would own the panel.
 */
export async function setupAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const env = await getAdminEnv();
  if (!env?.DB) return { error: NO_DB };
  if (!env.ADMIN_SESSION_SECRET) return { error: NO_SECRET };
  if ((await countAdmins(env.DB)) > 0) redirect("/login");

  // Either the ADMIN_SETUP_TOKEN secret, or a token this deployment minted
  // itself. The minted one is single-use and dies with the claim.
  const expected = env.ADMIN_SETUP_TOKEN?.trim();
  const token = String(formData.get("token") ?? "").trim();
  if (!token) return { error: "Enter the setup token." };
  const accepted =
    (await verifySetupToken(token, expected)) ||
    (await consumeSetupToken(env.DB, await hashToken(token)));
  if (!accepted) {
    console.warn(
      `admin setup: token mismatch (received ${token.length} chars, ` +
        `ADMIN_SETUP_TOKEN is ${expected?.length ?? 0})`,
    );
    /*
     * The character counts turn a dead end into something diagnosable — an
     * expected length of 0 means the secret is not set at all, not that you
     * mistyped. Withheld in production, where the length is a hint worth
     * denying an attacker.
     */
    const detail =
      process.env.NODE_ENV === "production" || !expected
        ? ""
        : ` Received ${token.length} characters, expected ${expected.length}.`;
    return { error: `That setup token is wrong or has expired.${detail}` };
  }

  const email = hydrateEmail(formData.get("email"));
  const password = hydratePassword(formData.get("password"));
  if (!email) return { error: "Enter a valid email address." };
  if (!password) return { error: SHORT_PASSWORD };

  const id = crypto.randomUUID();
  await createAdmin(env.DB, {
    id,
    email,
    passwordHash: await hashPassword(password),
    role: "owner",
  });
  await writeAudit(env.DB, {
    actor: email,
    action: "admin.setup",
    targetType: "admin",
    targetId: id,
  });
  await clearSetupTokens(env.DB);
  await startSession(id);
  redirect("/");
}

/*
 * Mints a claim token the deployment will actually accept, and writes it to the
 * server log — `wrangler tail` when deployed, the dev-server terminal locally.
 * Handed back to the browser only outside production: printing it into a public
 * page would give the panel to whoever loaded that page first, which is the
 * whole thing the token prevents.
 */
export async function mintSetupTokenAction(): Promise<MintState> {
  const env = await getAdminEnv();
  if (!env?.DB) return { error: NO_DB, token: null, logged: false };
  if ((await countAdmins(env.DB)) > 0) redirect("/login");

  const token = createToken();
  await createSetupToken(
    env.DB,
    await hashToken(token),
    Date.now() + SETUP_TOKEN_TTL_MS,
  );
  console.warn(`\n  admin setup token (valid 30 minutes):\n\n    ${token}\n`);
  return {
    error: null,
    token: process.env.NODE_ENV === "production" ? null : token,
    logged: true,
  };
}

export async function signInAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const env = await getAdminEnv();
  if (!env?.DB) return { error: NO_DB };
  if (!env.ADMIN_SESSION_SECRET) return { error: NO_SECRET };

  const email = hydrateEmail(formData.get("email"));
  const found = email ? await getAdminCredentials(env.DB, email) : null;
  const ok =
    found !== null &&
    found.account.status === "active" &&
    (await verifyPassword(
      String(formData.get("password") ?? ""),
      found.passwordHash,
    ));
  // One message for every failure: distinguishing them tells an attacker which
  // addresses are admins.
  if (!ok || !found) return { error: "Wrong email or password." };

  await touchAdminLogin(env.DB, found.account.id);
  await startSession(found.account.id);
  redirect("/");
}

export async function acceptInviteAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const env = await getAdminEnv();
  if (!env?.DB) return { error: NO_DB };

  const token = hydrateInviteToken(formData.get("token"));
  if (!token) return { error: "This invite link is not valid." };

  const password = hydratePassword(formData.get("password"));
  if (!password) return { error: SHORT_PASSWORD };

  const tokenHash = await hashToken(token);
  const invite = await getPendingInvite(env.DB, tokenHash);
  if (!invite) return { error: STALE_INVITE };
  if (await getAdminCredentials(env.DB, invite.email)) {
    return { error: "An admin already exists for that address." };
  }
  // Claim first: the row itself is the lock, so a second tab racing this one
  // loses here rather than creating a duplicate admin.
  if (!(await claimInvite(env.DB, tokenHash))) return { error: STALE_INVITE };

  const id = crypto.randomUUID();
  await createAdmin(env.DB, {
    id,
    email: invite.email,
    passwordHash: await hashPassword(password),
    role: invite.role,
  });
  await writeAudit(env.DB, {
    actor: invite.email,
    action: "admin.accept",
    targetType: "admin",
    targetId: id,
    detail: invite.role,
  });
  await startSession(id);
  redirect("/");
}

export async function saveQuotaAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const operator = await requirePermission("users.write");
  const env = await getAdminEnv();
  if (!env?.DB) return { error: NO_DB };

  const userId = hydrateUserId(formData.get("userId"));
  if (!userId) return { error: "Unknown user." };

  const quota = hydrateQuotaInput(formData);
  await setUserQuota(env.DB, userId, quota);
  await writeAudit(env.DB, {
    actor: operator.email,
    action: "quota.set",
    targetType: "user",
    targetId: userId,
    detail: JSON.stringify(quota),
  });
  revalidatePath(`/users/${userId}`);
  return { error: null };
}

export async function inviteAction(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const operator = await requirePermission("admins.manage");
  const env = await getAdminEnv();
  const fail = (error: string): InviteState => ({
    error,
    link: null,
    sent: false,
  });
  if (!env?.DB) return fail(NO_DB);

  const email = hydrateEmail(formData.get("email"));
  const role = hydrateRole(formData.get("role"));
  if (!email) return fail("Enter a valid email address.");
  if (!role) return fail("Pick a role.");
  if (await getAdminCredentials(env.DB, email)) {
    return fail("That address is already an admin.");
  }

  const token = createToken();
  await createInvite(env.DB, {
    tokenHash: await hashToken(token),
    email,
    role,
    invitedBy: operator.email,
    expiresAt: Date.now() + INVITE_TTL_MS,
  });
  await writeAudit(env.DB, {
    actor: operator.email,
    action: "admin.invite",
    targetType: "invite",
    targetId: email,
    detail: role,
  });

  const url = await inviteUrl(token);
  const sent = await sendInviteEmail(email, url, role);
  revalidatePath("/admins");
  // The link comes back only when it could not be mailed, so the operator can
  // pass it on by hand.
  return { error: null, link: sent ? null : url, sent };
}

export async function revokeInviteAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const operator = await requirePermission("admins.manage");
  const env = await getAdminEnv();
  if (!env?.DB) return { error: NO_DB };

  const tokenHash = String(formData.get("tokenHash") ?? "");
  if (!/^[0-9a-f]{64}$/.test(tokenHash)) return { error: "Unknown invite." };

  await deleteInvite(env.DB, tokenHash);
  await writeAudit(env.DB, {
    actor: operator.email,
    action: "admin.invite.revoke",
    targetType: "invite",
    targetId: String(formData.get("email") ?? tokenHash.slice(0, 12)),
  });
  revalidatePath("/admins");
  return { error: null };
}

/*
 * Every mutation below refuses to target the caller. Only owners hold
 * `admins.manage`, so that one rule is what keeps the deployment from ever
 * reaching zero active owners.
 */
type Target =
  | { ok: true; db: D1Database; actor: string; id: string; role: AdminRole }
  | { ok: false; error: string };

async function targetOther(formData: FormData): Promise<Target> {
  const operator = await requirePermission("admins.manage");
  const env = await getAdminEnv();
  if (!env?.DB) return { ok: false, error: NO_DB };

  const id = hydrateAdminId(formData.get("adminId"));
  if (!id) return { ok: false, error: "Unknown admin." };
  if (id === operator.id) {
    return { ok: false, error: "You cannot change your own account." };
  }
  const target = await getAdmin(env.DB, id);
  if (!target) return { ok: false, error: "Unknown admin." };
  return {
    ok: true,
    db: env.DB,
    actor: operator.email,
    id: target.id,
    role: target.role,
  };
}

export async function changeRoleAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const target = await targetOther(formData);
  if (!target.ok) return { error: target.error };
  const role = hydrateRole(formData.get("role"));
  if (!role) return { error: "Pick a role." };

  await updateAdminRole(target.db, target.id, role);
  await writeAudit(target.db, {
    actor: target.actor,
    action: "admin.role",
    targetType: "admin",
    targetId: target.id,
    detail: `${target.role} -> ${role}`,
  });
  revalidatePath("/admins");
  return { error: null };
}

export async function setStatusAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const target = await targetOther(formData);
  if (!target.ok) return { error: target.error };

  const status = formData.get("status") === "disabled" ? "disabled" : "active";
  await setAdminStatus(target.db, target.id, status);
  await writeAudit(target.db, {
    actor: target.actor,
    action: "admin.status",
    targetType: "admin",
    targetId: target.id,
    detail: status,
  });
  revalidatePath("/admins");
  return { error: null };
}

export async function removeAdminAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const target = await targetOther(formData);
  if (!target.ok) return { error: target.error };

  await deleteAdmin(target.db, target.id);
  await writeAudit(target.db, {
    actor: target.actor,
    action: "admin.remove",
    targetType: "admin",
    targetId: target.id,
  });
  revalidatePath("/admins");
  return { error: null };
}
