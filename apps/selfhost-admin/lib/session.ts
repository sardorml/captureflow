import { cache } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { isInstanceAdmin } from "@captureflow/selfhost/instance";
import { getEnv, type AdminEnv } from "./env";

type WebUser = { id: string; email: string; name: string | null };

// The web app owns sign-in. Its cookie arrives here unchanged, since both
// answer on one address, and it says over loopback whose session it is.
const currentUser = cache(async (): Promise<WebUser | null> => {
  const cookie = (await headers()).get("cookie");
  if (!cookie) return null;
  try {
    const res = await fetch(
      `${getEnv().WEB_INTERNAL_URL}/api/auth/get-session`,
      { headers: { cookie }, cache: "no-store" },
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { user?: WebUser } | null;
    return body?.user ?? null;
  } catch {
    return null;
  }
});

export type AdminAccess = AdminEnv & { user: WebUser };

/*
 * The gate every page and action stands behind. Signed-out visitors go to the
 * web app's login and come back here; a signed-in non-admin sees the same
 * page as for a URL that doesn't exist.
 */
export async function requireAdmin(): Promise<AdminAccess> {
  const env = getEnv();
  const user = await currentUser();
  if (!user) redirect(`${env.APP_URL}/login?next=%2Fadmin`);
  if (!(await isInstanceAdmin(env.DB, user.id))) notFound();
  return { ...env, user };
}
