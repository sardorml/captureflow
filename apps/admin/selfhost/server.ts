import {
  createRuntime,
  ensureSecrets,
  serveNextAt,
  setInjectedEnv,
} from "@captureflow/selfhost";

/*
 * Docker entry for apps/admin: same database and storage as the web
 * container (which owns migrations; compose starts this one after web is
 * healthy), then Next's standalone server. Campaign sending needs the
 * Cloudflare mailer, so MAIL_QUEUE stays unset and the panel says so.
 */

const runtime = createRuntime();
const { values: secrets, generated } = ensureSecrets(runtime.dataDir, [
  "ADMIN_SESSION_SECRET",
  "ADMIN_SETUP_TOKEN",
]);
if (generated.length > 0)
  console.log(
    `[selfhost] generated ${generated.join(", ")} in ${runtime.dataDir}/secrets.json`,
  );
if (!process.env.ADMIN_SETUP_TOKEN) {
  console.log(
    `[selfhost] first-run setup: open ${runtime.adminUrl}/setup and use ADMIN_SETUP_TOKEN from ${runtime.dataDir}/secrets.json`,
  );
}

setInjectedEnv({
  ...secrets,
  SELF_HOSTED: "true",
  ADMIN_BASE_URL: runtime.adminUrl,
  APP_BASE_URL: runtime.appUrl,
  ADMIN_SESSION_TTL_HOURS: process.env.ADMIN_SESSION_TTL_HOURS,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_ADDRESS: runtime.mailFrom,
  DB: runtime.DB,
  BUCKET: runtime.BUCKET,
  EMAIL: runtime.EMAIL,
});

serveNextAt(
  runtime.adminUrl,
  process.env.BIND_HOST ?? "0.0.0.0",
  Number(process.env.PORT ?? 3001),
);
// Next's standalone server; the Dockerfile puts this bundle beside it.
await import("./server.js");
