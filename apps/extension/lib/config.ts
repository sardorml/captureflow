/*
 * Origin of the CaptureFlow web app (sign-in + share API). Dev builds target the
 * local web server (`apps/web` runs on :3032); production builds target prod.
 * Override either with the WXT_WEB_BASE build env (see `.env.example`).
 */
export const WEB_BASE =
  import.meta.env.WXT_WEB_BASE ??
  (import.meta.env.COMMAND === "serve"
    ? "http://localhost:3032"
    : "https://captureflow.xyz");
