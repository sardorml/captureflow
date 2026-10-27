/// <reference types="@cloudflare/workers-types" />

import { cache } from "react";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensurePersonalWorkspace, isSelfHosted } from "@captureflow/quota";
import { authSchema } from "./auth-schema";
import { sendWelcomeEmail } from "./email";

// D1 is request-scoped (binding only exists inside a fetch handler), so the
// auth instance is built per request.

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
  // Comma-separated; when set, only verified addresses on these domains can sign up.
  ALLOWED_EMAIL_DOMAINS?: string;
  SELF_HOSTED?: string;
};

function buildAuth(
  env: AppWebEnv | null,
  baseURL?: string,
  waitUntil?: (promise: Promise<unknown>) => void,
) {
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
    // Lets server actions set the auth cookies they produce (sign-out).
    plugins: [nextCookies()],
    // Cookie is host-only so prod and preview (shared D1) stay isolated.
    // Do NOT re-enable crossSubDomainCookies with a .captureflow.dev domain.
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const domains = parseEmailDomains(env?.ALLOWED_EMAIL_DOMAINS);
            if (!signupAllowed(user, domains)) {
              throw new APIError("FORBIDDEN", {
                message: signupBlockedMessage(domains),
              });
            }
          },
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
            // Self-hosted instances are someone else's product; skip ours.
            if (baseURL && !isSelfHosted(env)) {
              const welcome = sendWelcomeEmail({
                to: user.email,
                name: typeof user.name === "string" ? user.name : null,
                appUrl: baseURL,
              }).catch((err) => {
                console.error("auth: welcome email failed", err);
                return false;
              });
              if (waitUntil) waitUntil(welcome);
              else await welcome;
            }
          },
        },
      },
    },
  };
  return betterAuth(options);
}

export function signupBlockedMessage(domains: string[]): string {
  return `Sign up with a Google or GitHub account on ${domains.map((d) => `@${d}`).join(" or ")}.`;
}

/*
 * OAuth failures come back as ?error= on /login. The text is never echoed, so
 * a crafted link can't put its own words in the form: a refused sign-up is
 * recognized and re-worded from the server's own allowlist.
 */
export function oauthErrorMessage(
  error: string | undefined,
  domains: string[],
): string | null {
  if (!error) return null;
  if (domains.length > 0 && error.startsWith("Sign_up_with_a_Google")) {
    return signupBlockedMessage(domains);
  }
  return "Sign-in didn't finish. Please try again.";
}

export function parseEmailDomains(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((d) => d.trim().toLowerCase().replace(/^@/, ""))
    .filter(Boolean);
}

/*
 * An empty list leaves sign-up open. Otherwise the address must be verified by
 * the sign-in provider, since a password sign-up could claim any address on an
 * allowed domain without owning it.
 */
export function signupAllowed(
  user: { email?: unknown; emailVerified?: unknown },
  domains: string[],
): boolean {
  if (domains.length === 0) return true;
  if (user.emailVerified !== true || typeof user.email !== "string") {
    return false;
  }
  const domain = user.email.split("@").pop()?.toLowerCase();
  return !!domain && domains.includes(domain);
}

export type AuthInstance = ReturnType<typeof buildAuth>;

// One instance per request: the dashboard's layout, chrome and page each ask
// for it, and outside a render React's cache is a plain call.
export const getAuth = cache(async (): Promise<AuthInstance> => {
  const ctx = await getCloudflareContext({ async: true });
  const env = (ctx?.env ?? null) as AppWebEnv | null;
  const baseURL = env?.BETTER_AUTH_URL;
  return buildAuth(env, baseURL, (p) => ctx.ctx.waitUntil(p));
});
