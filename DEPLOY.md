# Deploying CaptureFlow

This is a turnkey, ordered runbook for provisioning and deploying the
CaptureFlow web backend (`apps/web`) to your own Cloudflare account, plus
pointing the desktop recorder at it.

The web app is a Next.js 16 app built for Cloudflare Workers via
[OpenNext](https://opennext.js.org/cloudflare). One unified worker
(`captureflow-web`) serves the dashboard, auth, the recording viewer, the screenshot
viewer, and all API routes. It is backed by a single D1 database and a single
R2 bucket. Cron triggers run an hourly multipart-upload GC and a daily
retention sweep.

Everything except auth is optional: recording, sharing, the dashboard, and
storage quotas all work without billing or email configured.

---

## 0. Prerequisites

- A **Cloudflare account** with Workers + D1 + R2 enabled (R2 requires a card on
  file even on the free tier).
- A domain you control (the defaults assume **`captureflow.xyz`**). You can use
  any domain — adjust the URLs in `apps/web/wrangler.jsonc` accordingly.
- **Node 20+** and **pnpm 10** (`packageManager` pins `pnpm@10.30.0`).
- `openssl` (for generating the auth secret) — preinstalled on macOS/Linux.

Install workspace dependencies from the repo root:

```bash
pnpm install
```

All commands below are run **from the repo root** and target the web app via
`pnpm --filter @captureflow/web`. Wrangler is the workspace-local copy (no
global install needed).

---

## 1. Log in to Cloudflare

```bash
pnpm --filter @captureflow/web exec wrangler login
```

This opens a browser to authorize Wrangler against your Cloudflare account.
Confirm with:

```bash
pnpm --filter @captureflow/web exec wrangler whoami
```

---

## 2. Create the D1 database and paste its id

Create the database (the name **must** be `captureflow` — it matches
`wrangler.jsonc` and the `db:*` package scripts):

```bash
pnpm --filter @captureflow/web exec wrangler d1 create captureflow
```

Wrangler prints a `database_id`. Open **`apps/web/wrangler.jsonc`** and paste it
into `d1_databases[0].database_id`, replacing the placeholder:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "captureflow",
    "database_id": "REPLACE_AFTER_wrangler_d1_create"  // <- paste the real id here
  }
]
```

Then apply the schema migrations to the remote (production) database:

```bash
pnpm --filter @captureflow/web db:apply:remote
```

(This runs `wrangler d1 migrations apply captureflow --remote`. The migrations
live in `apps/web/migrations/`. For local-dev seeding use `db:seed:local`,
which executes `apps/web/db/schema.snapshot.sql` against the local D1.)

---

## 3. Create the R2 bucket

Create the recordings bucket (name **must** be `captureflow-recordings` — it
matches `wrangler.jsonc`):

```bash
pnpm --filter @captureflow/web exec wrangler r2 bucket create captureflow-recordings
```

Prefixes used inside the bucket: `videos/`, `posters/`, `screenshots/`.

For public reads over a CDN host (recording posters/videos and screenshot PNGs), bind
`cdn.captureflow.xyz` to this bucket's public domain — see **step 6**. The app
reads that origin from the `R2_PUBLIC_BASE_URL` var (default
`https://cdn.captureflow.xyz`).

---

## 4. Set secrets

Secrets are **never** stored in `wrangler.jsonc`. Push them with
`wrangler secret put` (each command prompts for the value, or accepts it on
stdin via a pipe).

### Required

```bash
openssl rand -hex 32 | pnpm --filter @captureflow/web exec wrangler secret put BETTER_AUTH_SECRET
```

`BETTER_AUTH_SECRET` signs Better Auth sessions. Without it, login does not
work.

### Optional — billing (Lemon Squeezy)

Skip this entire block to run with billing disabled.

```bash
pnpm --filter @captureflow/web exec wrangler secret put LEMON_WEBHOOK_SECRET
```

`LEMON_WEBHOOK_SECRET` is the HMAC-SHA256 signing secret from your Lemon
Squeezy webhook settings; the `/api/lemon-webhook` route rejects any event
whose `X-Signature` doesn't verify. Without it the webhook returns
`not configured`.

The variant IDs map an incoming subscription's `variant_id` to a billing cycle.
Set the live pair, and optionally the `*_TEST_*` pair so one deployment can
accept both Lemon Squeezy test and live webhooks during the test purchase flow.
These are non-sensitive but are read from the worker env; set them either as
secrets or as `vars` in `wrangler.jsonc` (secrets shown here for parity):

```bash
pnpm --filter @captureflow/web exec wrangler secret put LEMON_MONTHLY_VARIANT_ID
pnpm --filter @captureflow/web exec wrangler secret put LEMON_ANNUAL_VARIANT_ID
pnpm --filter @captureflow/web exec wrangler secret put LEMON_TEST_MONTHLY_VARIANT_ID
pnpm --filter @captureflow/web exec wrangler secret put LEMON_TEST_ANNUAL_VARIANT_ID
```

To show the "Upgrade to Pro" CTA, also set the public checkout link
`NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL` in `wrangler.jsonc` "vars" (it ships
empty, which hides the CTA).

### Optional — email (Resend)

Skip to disable invite emails (invite links can still be shared manually).

```bash
pnpm --filter @captureflow/web exec wrangler secret put RESEND_API_KEY
```

`RESEND_FROM_ADDRESS` (the verified "from" address) can be set as a secret the
same way, or left to its default `CaptureFlow <hello@captureflow.xyz>`.

---

## 5. Review public vars

The non-secret, public vars already live in `apps/web/wrangler.jsonc` under
`"vars"`. If you use a domain other than `captureflow.xyz`, update them now:

| Var                                      | Default                       |
| ---------------------------------------- | ----------------------------- |
| `NEXT_PUBLIC_APP_WEB_SITE_URL`           | `https://captureflow.xyz`     |
| `NEXT_PUBLIC_RECORDING_SITE_URL`         | `https://captureflow.xyz`     |
| `NEXT_PUBLIC_SCREENSHOT_SITE_URL`        | `https://captureflow.xyz`     |
| `NEXT_PUBLIC_MARKETING_SITE_URL`         | `https://captureflow.xyz`     |
| `R2_PUBLIC_BASE_URL`                     | `https://cdn.captureflow.xyz` |
| `BETTER_AUTH_URL`                        | `https://captureflow.xyz`     |
| `APP_DEEP_LINK_SCHEME`                   | `captureflow`                 |
| `NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL` | `` (empty = billing off)      |

`NEXT_PUBLIC_*` vars are inlined into the client bundle at build time, so they
are public by design — never put a secret behind a `NEXT_PUBLIC_` name.

---

## 6. Bind the custom domain(s)

Map the worker to your domain and the R2 bucket to the CDN host. Either via the
Cloudflare dashboard or by adding `routes` to `wrangler.jsonc`.

- **`captureflow.xyz`** → the `captureflow-web` worker (the unified app). In the
  dashboard: Workers & Pages → `captureflow-web` → Settings → Domains & Routes →
  add a custom domain. Or add to `wrangler.jsonc`:

  ```jsonc
  "routes": [
    { "pattern": "captureflow.xyz", "custom_domain": true }
  ]
  ```

- **`cdn.captureflow.xyz`** → the `captureflow-recordings` R2 bucket's public
  access. In the dashboard: R2 → `captureflow-recordings` → Settings → Public
  access → connect a custom domain (`cdn.captureflow.xyz`). This must match
  `R2_PUBLIC_BASE_URL`.

Both domains must be on a zone in the same Cloudflare account.

---

## 7. Deploy

```bash
pnpm --filter @captureflow/web cf:deploy
```

This chains `opennextjs-cloudflare build` → `opennextjs-cloudflare deploy`,
which builds Next.js, packages it through the custom `worker.ts` wrapper (which
re-exports OpenNext's fetch handler and adds the cron `scheduled()` handlers),
and publishes the worker with its D1/R2 bindings, vars, and cron triggers from
`wrangler.jsonc`.

> Tip: validate the build locally first with
> `pnpm --filter @captureflow/web cf:preview`, which builds and serves the
> worker against your `.dev.vars` and local D1.

---

## 8. Verify

1. Open `https://captureflow.xyz` — the dashboard / landing should load.
2. Sign up / log in — confirms `BETTER_AUTH_SECRET` + D1 are wired.
3. Check the worker logs for errors:
   ```bash
   pnpm --filter @captureflow/web exec wrangler tail captureflow-web
   ```
4. Record + recording from the desktop app and confirm the recording link resolves and
   the video plays from `cdn.captureflow.xyz` (confirms R2 + CDN domain).
5. (If billing enabled) Send a Lemon Squeezy test webhook and confirm the
   subscription row is written (no `invalid signature` / `not configured`).

---

## Continuous deployment (auto-deploy on push to `main`)

Once a manual `cf:deploy` works (steps 1–8), CI can publish for you. The
`deploy` job in **`.github/workflows/ci.yml`** runs on every push to `main`,
**after** the `build` job (typecheck + `next build`) passes, and:

1. applies any new D1 migrations to the production DB (`db:apply:remote`), then
2. builds with OpenNext and publishes the worker (`cf:deploy`).

Pull requests never deploy. Deploys are serialized (`concurrency`) so two
pushes can't publish at once.

### One-time setup

1. **Finish provisioning first.** The job deploys whatever is in the repo, so
   the real D1 `database_id` must be committed in `apps/web/wrangler.jsonc`
   (step 2) and the R2 bucket + runtime secrets must already exist (steps 3–4).
   Runtime secrets stay in Cloudflare via `wrangler secret put` — they are
   **not** GitHub secrets and are never needed by CI.

2. **Create a Cloudflare API token.** Dashboard → My Profile → API Tokens →
   _Create Token_ → use the **"Edit Cloudflare Workers"** template, scope
   _Account Resources_ to your account, and make sure these permissions are
   included (add any that are missing):

   - Account · **Workers Scripts** · Edit
   - Account · **D1** · Edit
   - Account · **Workers R2 Storage** · Edit

3. **Add two GitHub Actions secrets** (repo → Settings → Secrets and variables →
   Actions → _New repository secret_):

   | Secret                  | Value                                                                                |
   | ----------------------- | ------------------------------------------------------------------------------------ |
   | `CLOUDFLARE_API_TOKEN`  | the token from step 2                                                                |
   | `CLOUDFLARE_ACCOUNT_ID` | your Cloudflare account id (Workers & Pages → Account details, or `wrangler whoami`) |

That's it — push to `main` and watch the **deploy** job in the Actions tab. To
deploy manually instead, keep running `pnpm --filter @captureflow/web cf:deploy`
locally; the two paths are equivalent.

> Prefer Cloudflare's native Git integration? You can instead connect the repo
> under **Workers & Pages → Workers Builds** with build command
> `pnpm --filter @captureflow/web cf:build` and deploy command
> `pnpm --filter @captureflow/web exec opennextjs-cloudflare deploy`. The
> GitHub Actions job above is the in-repo, reproducible default and needs no
> dashboard wiring beyond the two secrets.

---

## 9. Point the desktop recorder at your backend

The desktop app (`apps/desktop`) talks to the web backend through four
build-time env vars. **All default to `https://captureflow.xyz`** (the unified
worker), so if you self-host on that domain you don't need to set anything.

To target a different host, set these before building the desktop app (they are
inlined at build time via `electron.vite.config.ts`):

| Env var                           | Default (prod fallback)         |
| --------------------------------- | ------------------------------- |
| `CAPTUREFLOW_APP_WEB_API_BASE`    | `https://captureflow.xyz`       |
| `CAPTUREFLOW_APP_WEB_BASE`        | `https://captureflow.xyz`       |
| `CAPTUREFLOW_RECORDING_API_BASE`  | `https://captureflow.xyz/api/r` |
| `CAPTUREFLOW_SCREENSHOT_API_BASE` | `https://captureflow.xyz/api/s` |

In local dev (`pnpm app`) these default to `http://localhost:3032` so the
desktop app talks to a locally-running worker.

---

## Environment reference

Scope legend:

- **worker-var** — non-secret, public; declared in `apps/web/wrangler.jsonc`
  `"vars"`. `NEXT_PUBLIC_*` are additionally inlined into the client bundle.
- **worker-secret** — sensitive; set with `wrangler secret put` (or `.dev.vars`
  locally). Never committed.
- **build (desktop)** — read by the desktop recorder at build time and inlined
  into the Electron bundle.

| Name                                     | Required?                     | Scope               | Purpose                                                                                      | How to set                                                                 |
| ---------------------------------------- | ----------------------------- | ------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET`                     | **Required**                  | worker-secret       | Signs Better Auth sessions.                                                                  | `openssl rand -hex 32 \| wrangler secret put BETTER_AUTH_SECRET`           |
| `BETTER_AUTH_URL`                        | Required (has prod default)   | worker-var          | Base URL Better Auth issues/validates sessions against.                                      | `wrangler.jsonc` "vars" (default `https://captureflow.xyz`)                |
| `NEXT_PUBLIC_APP_WEB_SITE_URL`           | Required (has default)        | worker-var (public) | Dashboard / app-web origin used for account + invite links.                                  | `wrangler.jsonc` "vars"                                                    |
| `NEXT_PUBLIC_RECORDING_SITE_URL`         | Required (has default)        | worker-var (public) | Recording viewer origin.                                                                     | `wrangler.jsonc` "vars"                                                    |
| `NEXT_PUBLIC_SCREENSHOT_SITE_URL`        | Required (has default)        | worker-var (public) | Screenshot viewer origin (legacy standalone host).                                           | `wrangler.jsonc` "vars"                                                    |
| `NEXT_PUBLIC_MARKETING_SITE_URL`         | Required (has default)        | worker-var (public) | Marketing root; recording + screenshot view pages build URLs off it.                         | `wrangler.jsonc` "vars"                                                    |
| `R2_PUBLIC_BASE_URL`                     | Required (has default)        | worker-var          | CDN origin for direct R2 reads (posters/videos/screenshots).                                 | `wrangler.jsonc` "vars" (default `https://cdn.captureflow.xyz`)            |
| `NEXT_PUBLIC_R2_PUBLIC_BASE_URL`         | Optional (has default)        | worker-var (public) | Client-side CDN origin for poster/video/screenshot thumbnails; mirrors `R2_PUBLIC_BASE_URL`. | `wrangler.jsonc` "vars" or `.dev.vars`                                     |
| `APP_DEEP_LINK_SCHEME`                   | Required (has default)        | worker-var          | Desktop deep-link scheme (`captureflow://`).                                                 | `wrangler.jsonc` "vars"                                                    |
| `APP_WEB_PUBLIC_URL`                     | Optional (has default)        | worker-var          | Public URL used when composing workspace-invite links.                                       | `wrangler.jsonc` "vars" or `.dev.vars` (default `https://captureflow.xyz`) |
| `NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL` | Optional                      | worker-var (public) | Public checkout link for "Upgrade to Pro"; empty disables billing UI.                        | `wrangler.jsonc` "vars"                                                    |
| `LEMON_WEBHOOK_SECRET`                   | Optional (billing)            | worker-secret       | HMAC secret verifying Lemon Squeezy webhook signatures.                                      | `wrangler secret put LEMON_WEBHOOK_SECRET`                                 |
| `LEMON_MONTHLY_VARIANT_ID`               | Optional (billing)            | worker-secret/var   | Live monthly variant id → billing cycle.                                                     | `wrangler secret put` or "vars"                                            |
| `LEMON_ANNUAL_VARIANT_ID`                | Optional (billing)            | worker-secret/var   | Live annual variant id → billing cycle.                                                      | `wrangler secret put` or "vars"                                            |
| `LEMON_TEST_MONTHLY_VARIANT_ID`          | Optional (billing)            | worker-secret/var   | Test-mode monthly variant id (accept test webhooks).                                         | `wrangler secret put` or "vars"                                            |
| `LEMON_TEST_ANNUAL_VARIANT_ID`           | Optional (billing)            | worker-secret/var   | Test-mode annual variant id (accept test webhooks).                                          | `wrangler secret put` or "vars"                                            |
| `RESEND_API_KEY`                         | Optional (email)              | worker-secret       | Resend API key for workspace-invite emails. Unset = sends skipped.                           | `wrangler secret put RESEND_API_KEY`                                       |
| `RESEND_FROM_ADDRESS`                    | Optional (email, has default) | worker-secret/var   | Verified "from" address for invite emails.                                                   | `wrangler secret put` (default `CaptureFlow <hello@captureflow.xyz>`)      |
| `DB`                                     | **Required** (binding)        | binding             | D1 database binding.                                                                         | `wrangler d1 create captureflow` + paste id into `wrangler.jsonc`          |
| `BUCKET`                                 | **Required** (binding)        | binding             | R2 recordings bucket binding.                                                                | `wrangler r2 bucket create captureflow-recordings`                         |
| `ASSETS`                                 | **Required** (binding)        | binding             | Static-assets fetcher; auto-wired by OpenNext build.                                         | `wrangler.jsonc` `assets` (no manual step)                                 |
| `CAPTUREFLOW_APP_WEB_API_BASE`           | Optional (has default)        | build (desktop)     | Desktop → app-web API base (usage, workspaces).                                              | desktop `.env` (default `https://captureflow.xyz`)                         |
| `CAPTUREFLOW_APP_WEB_BASE`               | Optional (has default)        | build (desktop)     | Desktop → app-web base (account, edit links).                                                | desktop `.env` (default `https://captureflow.xyz`)                         |
| `CAPTUREFLOW_RECORDING_API_BASE`         | Optional (has default)        | build (desktop)     | Desktop → recording API base.                                                                | desktop `.env` (default `https://captureflow.xyz/api/r`)                   |
| `CAPTUREFLOW_SCREENSHOT_API_BASE`        | Optional (has default)        | build (desktop)     | Desktop → screenshot API base.                                                               | desktop `.env` (default `https://captureflow.xyz/api/s`)                   |

> Desktop-only build extras (not part of the web backend): `LEMON_SQUEEZY_CHECKOUT_URL`
> / `LEMON_SQUEEZY_TEST_CHECKOUT_URL` (Recording-mode upgrade link), `POSTHOG_KEY`
> / `POSTHOG_HOST` (opt-in analytics, dormant when unset), and `FORMIK_KEY`.
> See `apps/desktop/electron.vite.config.ts`.
