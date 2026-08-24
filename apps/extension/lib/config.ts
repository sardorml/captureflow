/*
 * Origin of the web app. Keyed off MODE, not COMMAND: `wxt build --mode
 * development` reports COMMAND === "build", so keying off the command pointed
 * every dev build at production while looking like it handled dev.
 *
 * `apps/web` dev server runs on :3032. Override with the WXT_WEB_BASE build env.
 */
export const WEB_BASE =
  import.meta.env.WXT_WEB_BASE ??
  (import.meta.env.MODE === "production"
    ? "https://captureflow.dev"
    : "http://localhost:3032");
