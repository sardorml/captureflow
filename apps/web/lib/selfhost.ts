import type { SelfHostHooks } from "@captureflow/selfhost/hooks";
import { cache } from "react";
import { getAppWebEnv } from "./cf-env";

// Present only when the Docker server injected it; on Cloudflare it's null and
// every caller keeps the hosted behavior.
export async function selfHostHooks(): Promise<SelfHostHooks | null> {
  return (await getAppWebEnv())?.SELFHOST ?? null;
}

export const isInstanceAdminUser = cache(async function isInstanceAdminUser(
  userId: string,
): Promise<boolean> {
  const hooks = await selfHostHooks();
  return hooks ? hooks.isAdmin(userId) : false;
});
