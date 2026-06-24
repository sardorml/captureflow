// `apps/web` dev server runs on :3032. Override with the WXT_WEB_BASE build env.
export const WEB_BASE =
  import.meta.env.WXT_WEB_BASE ??
  (import.meta.env.COMMAND === "serve"
    ? "http://localhost:3032"
    : "https://captureflow.xyz");
