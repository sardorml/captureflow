import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { createD1 } from "./d1";
import { createLogEmail, createSmtpEmail } from "./email";
import { createR2 } from "./r2";

export type SelfHostRuntime = {
  dataDir: string;
  appUrl: string;
  adminUrl: string;
  mailFrom: string;
  DB: D1Database;
  BUCKET: R2Bucket;
  EMAIL?: SendEmail;
};

function origin(raw: string, name: string): string {
  try {
    return new URL(raw).origin;
  } catch {
    throw new Error(
      `${name} must be an absolute URL like https://rec.example.com (got "${raw}")`,
    );
  }
}

// The pieces web and admin share: one SQLite file and one object directory
// under DATA_DIR, and the same outgoing-mail setup.
export function createRuntime(
  env: NodeJS.ProcessEnv = process.env,
): SelfHostRuntime {
  const dataDir = env.DATA_DIR ?? "/data";
  mkdirSync(join(dataDir, "storage"), { recursive: true });
  const appUrl = origin(env.APP_URL ?? "http://localhost:3000", "APP_URL");
  const adminUrl = origin(
    env.ADMIN_URL ?? "http://localhost:3001",
    "ADMIN_URL",
  );
  const mailFrom =
    env.MAIL_FROM ?? `CaptureFlow <noreply@${new URL(appUrl).hostname}>`;
  // With RESEND_API_KEY set the binding stays empty and the app's own Resend path sends.
  const email = env.SMTP_URL
    ? createSmtpEmail(env.SMTP_URL)
    : env.RESEND_API_KEY
      ? undefined
      : createLogEmail();
  return {
    dataDir,
    appUrl,
    adminUrl,
    mailFrom,
    DB: createD1(join(dataDir, "captureflow.sqlite")),
    BUCKET: createR2(join(dataDir, "storage")),
    EMAIL: email,
  };
}

// Only plain strings from the environment pass through to the bindings bag.
export function stringEnv(
  env: NodeJS.ProcessEnv,
  names: string[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of names) {
    const value = env[name];
    if (value) out[name] = value;
  }
  return out;
}
