/// <reference types="@cloudflare/workers-types" />

import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  attachSubscriptionToUser,
  ensurePersonalWorkspace,
  getUnclaimedProSubscriptionByEmail,
} from "@captureflow/quota";
import { authSchema } from "./auth-schema";

// D1 is request-scoped (binding only exists inside a fetch handler), so the
// auth instance is built per request; build-time imports use a stub adapter.

type AppWebEnv = {
  DB: D1Database;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  // Comma-separated extra origins accepted for POSTs, beyond baseURL's own.
  BETTER_AUTH_TRUSTED_ORIGINS?: string;
  // Desktop deep-link scheme; trusted so `captureflow://` auth callbacks aren't rejected.
  APP_DEEP_LINK_SCHEME?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
};

function buildAuth(env: AppWebEnv | null, baseURL?: string) {
  const db = env
    ? drizzle(env.DB, { schema: authSchema })
    : (drizzle({} as D1Database, { schema: authSchema }) as ReturnType<
        typeof drizzle
      >);

  const scheme = env?.APP_DEEP_LINK_SCHEME ?? "captureflow";
  const trustedOrigins = [
    `${scheme}://`,
    ...(env?.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean),
  ];

  // Providers appear only once their env creds exist, so the sign-in buttons
  // fail with a clear error instead of a half-configured OAuth redirect.
  const socialProviders: NonNullable<BetterAuthOptions["socialProviders"]> = {};
  if (env?.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    socialProviders.google = {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    };
  }
  if (env?.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    socialProviders.github = {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    };
  }

  const options: BetterAuthOptions = {
    baseURL,
    trustedOrigins,
    secret: env?.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      usePlural: true,
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      minPasswordLength: 12,
    },
    socialProviders,
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    // Cookie is host-only so prod and preview (shared D1) stay isolated.
    // Do NOT re-enable crossSubDomainCookies with a .captureflow.xyz domain.
    databaseHooks: {
      user: {
        create: {
          // Best-effort: never block sign-up on failure (user row is committed).
          after: async (user) => {
            if (!env?.DB) return;
            const db = env.DB;
            try {
              await ensurePersonalWorkspace(
                db,
                user.id,
                typeof user.name === "string" ? user.name : null,
              );
            } catch (err) {
              console.error("auth: ensurePersonalWorkspace failed", err);
            }
            try {
              const email = typeof user.email === "string" ? user.email : null;
              if (email) {
                const unclaimed = await getUnclaimedProSubscriptionByEmail(
                  db,
                  email,
                );
                if (unclaimed) {
                  await attachSubscriptionToUser(
                    db,
                    unclaimed.ls_subscription_id,
                    user.id,
                  );
                }
              }
            } catch (err) {
              console.error("auth: pro-subscription claim failed", err);
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

export const auth = buildAuth(null);
