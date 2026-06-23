/// <reference types="@cloudflare/workers-types" />

import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { drizzle } from 'drizzle-orm/d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import {
  attachSubscriptionToUser,
  ensurePersonalWorkspace,
  getUnclaimedProSubscriptionByEmail,
} from '@captureflow/quota';
import { authSchema } from './auth-schema';

// Cloudflare D1 is request-scoped — the binding only exists inside a
// fetch handler, so we build the auth instance per request. Build-time
// imports (CLI / type introspection) fall back to a stub adapter.

type AppWebEnv = {
  DB: D1Database;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  // Comma-separated extra origins Better Auth accepts for POSTs, beyond
  // baseURL's own (always-trusted) origin: the dev ports + electron-vite
  // renderer origin.
  BETTER_AUTH_TRUSTED_ORIGINS?: string;
  // Desktop deep-link scheme (default `captureflow`) — trusted so the
  // packaged app's `captureflow://` auth-callback returns aren't rejected.
  APP_DEEP_LINK_SCHEME?: string;
};

function buildAuth(env: AppWebEnv | null, baseURL?: string) {
  const db = env
    ? drizzle(env.DB, { schema: authSchema })
    : (drizzle({} as D1Database, { schema: authSchema }) as ReturnType<
        typeof drizzle
      >);

  // Origins accepted for state-changing (POST) auth requests, on top of
  // baseURL's always-trusted origin: the desktop deep-link scheme plus
  // any comma-listed origins.
  const scheme = env?.APP_DEEP_LINK_SCHEME ?? 'captureflow';
  const trustedOrigins = [
    `${scheme}://`,
    ...(env?.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  ];

  const options: BetterAuthOptions = {
    baseURL,
    trustedOrigins,
    secret: env?.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      usePlural: true,
    }),
    emailAndPassword: {
      enabled: true,
      // Land users on the dashboard right after sign-up, skipping a
      // forced manual login.
      autoSignIn: true,
      // 12-char floor (matching the admin app) for password hygiene
      // without forcing 2FA — too heavy for the first pass.
      minPasswordLength: 12,
    },
    session: {
      // 30-day session lifetime — longer than admin (7d) since users
      // expect a recorder dashboard to stay signed in.
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    // Session cookie is HOST-ONLY (better-auth's default, no Domain
    // attribute). Host-only scoping keeps PRODUCTION (captureflow.xyz) and
    // the PREVIEW deploy (dev.captureflow.xyz) isolated even though both
    // share the same D1: a session minted on one is never sent to the other.
    // Do NOT re-enable `crossSubDomainCookies` with a `.captureflow.xyz`
    // domain — that would leak prod sessions into preview and vice versa.
    databaseHooks: {
      user: {
        create: {
          // Bootstrap account-scoped state for every new signup:
          //   1. A personal workspace so artifacts can be stamped with
          //      `workspace_id` from the start.
          //   2. Any pro_subscription rows the Lemon Squeezy webhook
          //      cached against this email, so a user who paid before
          //      signing up still lands with Pro entitlement.
          // Both writes are best-effort — the user row is already
          // committed, so we never block sign-up on failure. ensurePersonal-
          // Workspace is idempotent, so the next request can re-run it.
          after: async (user) => {
            if (!env?.DB) return;
            const db = env.DB;
            try {
              await ensurePersonalWorkspace(
                db,
                user.id,
                typeof user.name === 'string' ? user.name : null
              );
            } catch (err) {
              console.error('auth: ensurePersonalWorkspace failed', err);
            }
            try {
              const email = typeof user.email === 'string' ? user.email : null;
              if (email) {
                const unclaimed = await getUnclaimedProSubscriptionByEmail(
                  db,
                  email
                );
                if (unclaimed) {
                  await attachSubscriptionToUser(
                    db,
                    unclaimed.ls_subscription_id,
                    user.id
                  );
                }
              }
            } catch (err) {
              console.error('auth: pro-subscription claim failed', err);
            }
          },
        },
      },
    },
  };
  return betterAuth(options);
}

export type AuthInstance = ReturnType<typeof buildAuth>;

export async function getAuth(): Promise<AuthInstance> {
  const ctx = await getCloudflareContext({ async: true });
  const env = (ctx?.env ?? null) as AppWebEnv | null;
  const baseURL = env?.BETTER_AUTH_URL;
  return buildAuth(env, baseURL);
}

// Build-time stub: better-auth's type-level helpers only need some
// instance, and the D1 connection is never touched here.
export const auth = buildAuth(null);
