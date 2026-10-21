"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";

/*
 * Revokes the session, clears the cookie and lands on /login in one response.
 * Signing out from the client took two trips through the worker, the sign-out
 * call and then the navigation, and each could be a cold start.
 */
export async function signOutAction(): Promise<void> {
  const auth = await getAuth();
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch (err) {
    console.error("[auth] signOut threw:", err);
    redirect("/auth/clear");
  }
  redirect("/login");
}
