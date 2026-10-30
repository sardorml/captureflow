/// <reference types="@cloudflare/workers-types" />

import type { MailerMessage } from "@captureflow/mail";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getInjectedEnv } from "@captureflow/selfhost/env-slot";

type MailQueue = { send(message: MailerMessage): Promise<unknown> };

export type AdminBindings = {
  DB?: D1Database;
  BUCKET?: R2Bucket;
  MAIL_QUEUE?: MailQueue;
  // Secrets: `wrangler secret put ADMIN_SESSION_SECRET` / ADMIN_SETUP_TOKEN.
  ADMIN_SESSION_SECRET?: string;
  ADMIN_SETUP_TOKEN?: string;
  ADMIN_SESSION_TTL_HOURS?: string;
  ADMIN_BASE_URL?: string;
  APP_BASE_URL?: string;
  EMAIL?: SendEmail;
  RESEND_API_KEY?: string;
  RESEND_FROM_ADDRESS?: string;
  SELF_HOSTED?: string;
  MAILER_DEV_URL?: string;
  POSTHOG_API_HOST?: string;
  POSTHOG_PROJECT_ID?: string;
  POSTHOG_PERSONAL_API_KEY?: string;
};

// Local dev only: `next dev` can't reach the mailer's queue, so post to the
// mailer's dev inbox instead (see apps/mailer/src/index.ts).
function devMailQueue(base: string): MailQueue {
  const send = async (body: MailerMessage) => {
    const res = await fetch(`${base.replace(/\/+$/, "")}/dev/queue`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`mailer dev inbox: ${res.status}`);
  };
  return { send };
}

// Bindings are request-scoped, so this resolves per call and is never cached at
// module scope.
export async function getAdminEnv(): Promise<AdminBindings | null> {
  const injected = getInjectedEnv<AdminBindings>();
  if (injected) return injected;
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as AdminBindings;
    if (process.env.NODE_ENV === "development" && env.MAILER_DEV_URL) {
      return { ...env, MAIL_QUEUE: devMailQueue(env.MAILER_DEV_URL) };
    }
    return env;
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
