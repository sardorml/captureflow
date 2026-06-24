// Origin of the CaptureFlow web app (sign-in + share API). Override for staging
// via the WXT_WEB_BASE build env; see `.env.example`. Defaults to production.
export const WEB_BASE =
  import.meta.env.WXT_WEB_BASE ?? "https://captureflow.xyz";
