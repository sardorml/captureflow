/// <reference types="@cloudflare/workers-types" />

import {
  claimFirstInstanceAdmin,
  getInstanceSignupState,
  instanceSignupRefusal,
  isInstanceAdmin,
  type InstanceSignupState,
} from "./instance";

/*
 * What the web app asks a self-hosted instance. The Docker server puts one of
 * these in the injected env; on Cloudflare the field is absent and the web app
 * skips every call, so the hosted product never runs this code.
 * signupRefusal gives the message to refuse a sign-up with, or null.
 */
export type SelfHostHooks = {
  signupRefusal(
    user: { email: string; emailVerified?: unknown },
    callbackUrl: unknown,
  ): Promise<string | null>;
  afterSignup(userId: string): Promise<void>;
  signupState(): Promise<InstanceSignupState>;
  isAdmin(userId: string): Promise<boolean>;
};

export function inviteTokenFromPath(path: unknown): string | null {
  if (typeof path !== "string") return null;
  return /^\/invite\/([^/?#]+)$/.exec(path)?.[1] ?? null;
}

export function createSelfHostHooks(db: D1Database): SelfHostHooks {
  return {
    signupRefusal: (user, callbackUrl) =>
      instanceSignupRefusal(db, user, inviteTokenFromPath(callbackUrl)),
    afterSignup: (userId) => claimFirstInstanceAdmin(db, userId),
    signupState: () => getInstanceSignupState(db),
    isAdmin: (userId) => isInstanceAdmin(db, userId),
  };
}
