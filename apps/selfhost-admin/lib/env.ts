/// <reference types="@cloudflare/workers-types" />

import { getInjectedEnv } from "@captureflow/selfhost/env-slot";

export type Mailer = {
  send(message: {
    from: string;
    to: string;
    subject: string;
    text: string;
  }): Promise<unknown>;
};

export type AdminEnv = {
  DB: D1Database;
  EMAIL?: Mailer;
  APP_URL: string;
  // The web app on its loopback port; it answers who the cookie belongs to.
  WEB_INTERNAL_URL: string;
  MAIL_FROM: string;
};

// Filled by selfhost/server.ts before Next boots; empty during `next build`.
export function readEnv(): AdminEnv | null {
  return getInjectedEnv<AdminEnv>();
}

export function getEnv(): AdminEnv {
  const env = readEnv();
  if (!env) {
    throw new Error("selfhost-admin: start it through selfhost/server.ts");
  }
  return env;
}
