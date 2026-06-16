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

| Binding | Purpose | How to set |
| --- | --- | --- |
| `DB` | D1 database | `wrangler d1 create captureflow` → paste id into `wrangler.jsonc` |
| `BUCKET` | R2 recordings bucket | `wrangler r2 bucket create captureflow-recordings` |
| `ASSETS` | Static-assets fetcher | Auto-wired by the OpenNext build |

## Auth

| Var | Required? | Scope | Purpose |
| --- | --- | --- | --- |
| `BETTER_AUTH_SECRET` | **Required** | secret | Signs Better Auth sessions. Login won't work without it. |
| `BETTER_AUTH_URL` | Required (has default) | var | Base URL sessions are issued/validated against. |

```bash
openssl rand -hex 32 | pnpm --filter @captureflow/web exec wrangler secret put BETTER_AUTH_SECRET
```

## Site URLs & CDN (public vars)

All default to `https://captureflow.xyz` / `https://cdn.captureflow.xyz`. Change
them if you use a different domain.

| Var | Default |
| --- | --- |
| `NEXT_PUBLIC_APP_WEB_SITE_URL` | `https://captureflow.xyz` |
| `NEXT_PUBLIC_SHARE_SITE_URL` | `https://captureflow.xyz` |
| `NEXT_PUBLIC_SNAP_SITE_URL` | `https://captureflow.xyz` |
| `NEXT_PUBLIC_MARKETING_SITE_URL` | `https://captureflow.xyz` |
| `R2_PUBLIC_BASE_URL` | `https://cdn.captureflow.xyz` |
| `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` | mirrors `R2_PUBLIC_BASE_URL` |
| `APP_DEEP_LINK_SCHEME` | `captureflow` (the `captureflow://` deep link) |
| `APP_WEB_PUBLIC_URL` | `https://captureflow.xyz` (invite links) |

## Email — Resend (optional)

Skip to disable invite emails (invite links can still be shared manually).

| Var | Scope | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | secret | Resend API key for workspace-invite emails. Unset = sends skipped. |
| `RESEND_FROM_ADDRESS` | secret/var | Verified "from" address. Default `CaptureFlow <hello@captureflow.xyz>`. |

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
