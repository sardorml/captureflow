/// <reference types="@cloudflare/workers-types" />

import { getCloudflareContext } from "@opennextjs/cloudflare";

export type AdminBindings = {
  DB?: D1Database;
  BUCKET?: R2Bucket;
  // Secrets: `wrangler secret put ADMIN_SESSION_SECRET` / ADMIN_SETUP_TOKEN.
  ADMIN_SESSION_SECRET?: string;
  ADMIN_SETUP_TOKEN?: string;
  ADMIN_SESSION_TTL_HOURS?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_ADDRESS?: string;
};

// Bindings are request-scoped, so this resolves per call and is never cached at
// module scope.
export async function getAdminEnv(): Promise<AdminBindings | null> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    return ctx.env as AdminBindings;
  } catch {
    return null;
  }
}

export async function requireDb(): Promise<D1Database | null> {
  return (await getAdminEnv())?.DB ?? null;
}

export function sessionTtlSeconds(env: AdminBindings | null): number {
  const hours = Number(env?.ADMIN_SESSION_TTL_HOURS ?? 12);
  return (Number.isFinite(hours) && hours > 0 ? hours : 12) * 3600;
}
