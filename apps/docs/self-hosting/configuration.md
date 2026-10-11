# Configuration & environment

Every variable the CaptureFlow backend reads, where it lives, and whether you
need it. Most have sensible defaults — the only hard requirement is
`BETTER_AUTH_SECRET`.

## Scopes

- **worker-var** — non-secret, public; declared in `apps/web/wrangler.jsonc`
  under `"vars"`. `NEXT_PUBLIC_*` are additionally inlined into the client
  bundle.
- **worker-secret** — sensitive; set with `wrangler secret put` (or `.dev.vars`
  locally). Never committed.
- **binding** — a Cloudflare resource binding (D1, R2, assets).
- **build (desktop)** — read by the desktop recorder at build time.

## Bindings (required)

| Binding  | Purpose               | How to set                                                        |
| -------- | --------------------- | ----------------------------------------------------------------- |
| `DB`     | D1 database           | `wrangler d1 create captureflow` → paste id into `wrangler.jsonc` |
| `BUCKET` | R2 recordings bucket  | `wrangler r2 bucket create captureflow-recordings`                |
| `ASSETS` | Static-assets fetcher | Auto-wired by the OpenNext build                                  |

## Auth

| Var                  | Required?              | Scope  | Purpose                                                  |
| -------------------- | ---------------------- | ------ | -------------------------------------------------------- |
| `BETTER_AUTH_SECRET` | **Required**           | secret | Signs Better Auth sessions. Login won't work without it. |
| `BETTER_AUTH_URL`    | Required (has default) | var    | Base URL sessions are issued/validated against.          |

```bash
openssl rand -hex 32 | pnpm --filter @captureflow/web exec wrangler secret put BETTER_AUTH_SECRET
```

## Sign-in providers (optional)

Email and password sign-in always works. Google and GitHub buttons appear once
their credentials are set, and a
[private company instance](#private-company-instance) with an email allowlist
needs at least one of them.

| Var                    | Scope  | Purpose                     |
| ---------------------- | ------ | --------------------------- |
| `GOOGLE_CLIENT_ID`     | secret | Google OAuth client id.     |
| `GOOGLE_CLIENT_SECRET` | secret | Google OAuth client secret. |
| `GITHUB_CLIENT_ID`     | secret | GitHub OAuth app client id. |
| `GITHUB_CLIENT_SECRET` | secret | GitHub OAuth app secret.    |

Register `https://<your-domain>/api/auth/callback/google` (or `/github`) as the
redirect URL with the provider.

## Private company instance

These turn a deployment into an internal tool for one company.

| Var                               | Scope | Purpose                                                                                                                                                                               |
| --------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SELF_HOSTED`                     | var   | `"true"` removes the default storage cap and the 30-day idle-recording sweep, hides billing and upgrade screens, and sends the marketing pages to the login page.                     |
| `ALLOWED_EMAIL_DOMAINS`           | var   | Comma-separated, e.g. `acme.com,acme.io`. Only addresses on these domains can create an account, and only through Google or GitHub, which verify the address. Unset = open sign-up.   |
| `CAPTUREFLOW_EXTENSION_ID`        | var   | The id of your own build of the Chrome extension. Sign-in is only handed to this id, so leaving it unset rejects every extension. See [Point the extension](/self-hosting/extension). |
| `NEXT_PUBLIC_CHROME_WEBSTORE_URL` | build | Where record buttons send people who don't have the extension yet. Set it in the build environment before `cf:deploy`; defaults to the public CaptureFlow listing.                    |

With `SELF_HOSTED` on, each user's storage is limited only by your R2 bill. To
cap someone, set a per-user override from the admin app.

## Site URLs & CDN (public vars)

All default to `https://captureflow.dev` / `https://cdn.captureflow.dev`. Change
them if you use a different domain.

| Var                               | Default                                        |
| --------------------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_APP_WEB_SITE_URL`    | `https://captureflow.dev`                      |
| `NEXT_PUBLIC_RECORDING_SITE_URL`  | `https://captureflow.dev`                      |
| `NEXT_PUBLIC_SCREENSHOT_SITE_URL` | `https://captureflow.dev`                      |
| `NEXT_PUBLIC_MARKETING_SITE_URL`  | `https://captureflow.dev`                      |
| `R2_PUBLIC_BASE_URL`              | `https://cdn.captureflow.dev`                  |
| `NEXT_PUBLIC_R2_PUBLIC_BASE_URL`  | mirrors `R2_PUBLIC_BASE_URL`                   |
| `APP_DEEP_LINK_SCHEME`            | `captureflow` (the `captureflow://` deep link) |
| `APP_WEB_PUBLIC_URL`              | `https://captureflow.dev` (invite links)       |

## Email — Resend (optional)

Skip to disable invite emails (invite links can still be shared manually).

| Var                   | Scope      | Purpose                                                                 |
| --------------------- | ---------- | ----------------------------------------------------------------------- |
| `RESEND_API_KEY`      | secret     | Resend API key for workspace-invite emails. Unset = sends skipped.      |
| `RESEND_FROM_ADDRESS` | secret/var | Verified "from" address. Default `CaptureFlow <hello@captureflow.dev>`. |

## Local development

For local dev, put secrets in `apps/web/.dev.vars` (see `.dev.vars.example`) and
seed a local D1:

```bash
pnpm --filter @captureflow/web db:seed:local   # apply schema snapshot to local D1
pnpm --filter @captureflow/web dev             # Next.js dev server on :3032
pnpm --filter @captureflow/web cf:preview       # build + serve the Worker locally
```

For the full annotated table (including desktop build vars), see
[`DEPLOY.md`](https://github.com/sardorml/captureflow/blob/main/DEPLOY.md).
