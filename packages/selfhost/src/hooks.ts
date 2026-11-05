/// <reference types="@cloudflare/workers-types" />

import { getPasswordLinkEmail, inviteRefusal, signinRefusal } from "./accounts";
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
 * skips every call, so the hosted product never runs this code. The
 * *Refusal calls give the message to refuse with, or null.
 */
export type SelfHostHooks = {
  signupRefusal(
    user: { email: string; emailVerified?: unknown },
    callbackUrl: unknown,
  ): Promise<string | null>;
  afterSignup(userId: string): Promise<void>;
  signupState(): Promise<InstanceSignupState>;
  isAdmin(userId: string): Promise<boolean>;
  signinRefusal(userId: string): Promise<string | null>;
  inviteRefusal(inviterUserId: string, email: string): Promise<string | null>;
  passwordLinkEmail(token: string): Promise<string | null>;
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
    signinRefusal: (userId) => signinRefusal(db, userId),
    inviteRefusal: (inviterUserId, email) =>
      inviteRefusal(db, inviterUserId, email),
    passwordLinkEmail: (token) => getPasswordLinkEmail(db, token),
  };
}
