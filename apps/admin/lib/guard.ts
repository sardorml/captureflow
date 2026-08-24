import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  type AdminAccount,
  type AdminPermission,
  can,
  countAdmins,
  getAdmin,
  verifySession,
} from "@captureflow/admin";
import { getAdminEnv } from "./env";

/*
 * The single gate for every admin page and server action. Actions can be
 * replayed directly, so each one calls this rather than trusting that the page
 * which rendered the form was itself gated.
 *
 * Role and status come from the row, not the cookie: a demotion or removal has
 * to take effect on the next request, not when the session happens to expire.
 */
export async function currentOperator(): Promise<AdminAccount | null> {
  const env = await getAdminEnv();
  if (!env?.DB) return null;
  const cookie = (await cookies()).get(ADMIN_COOKIE)?.value;
  const adminId = await verifySession(env.ADMIN_SESSION_SECRET, cookie);
  if (!adminId) return null;
  const account = await getAdmin(env.DB, adminId);
  return account?.status === "active" ? account : null;
}

export async function requireOperator(): Promise<AdminAccount> {
  const operator = await currentOperator();
  if (operator) return operator;

  const env = await getAdminEnv();
  // A deployment with no admins yet is unclaimed, so send the operator to
  // first-run setup instead of a sign-in form nobody can pass.
  if (env?.DB && (await countAdmins(env.DB)) === 0) redirect("/setup");
  redirect("/login");
}

export async function requirePermission(
  permission: AdminPermission,
): Promise<AdminAccount> {
  const operator = await requireOperator();
  if (!can(operator.role, permission)) redirect("/");
  return operator;
}
