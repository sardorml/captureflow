import { createRuntime, setInjectedEnv } from "@captureflow/selfhost";
import type { AdminEnv } from "../lib/env";

/*
 * Docker entry for the admin app. The web container starts this as a child
 * process on a loopback port and forwards /admin to it; it opens the same
 * SQLite file and mail setup as the web app, then boots Next's standalone
 * server.
 */

const runtime = createRuntime();

const env: AdminEnv = {
  DB: runtime.DB,
  BUCKET: runtime.BUCKET,
  DATA_DIR: runtime.dataDir,
  EMAIL: runtime.EMAIL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  MAIL_CONFIGURED: Boolean(process.env.SMTP_URL || process.env.RESEND_API_KEY),
  APP_URL: runtime.appUrl,
  WEB_INTERNAL_URL: process.env.WEB_INTERNAL_URL ?? "http://127.0.0.1:3000",
  MAIL_FROM: runtime.mailFrom,
};
setInjectedEnv(env);

// Next's standalone server; the Dockerfile puts this bundle beside it.
await import("./server.js");
