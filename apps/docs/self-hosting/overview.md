# Self-hosting overview

There are two ways to run your own CaptureFlow:

- **[Docker](/self-hosting/docker).** `docker compose up` on any server. Data
  stays in a local folder (SQLite plus files on disk), and you don't need a
  Cloudflare account.
- **Your own Cloudflare account.** One Worker serves the dashboard, auth, the
  recording and screenshot viewers, and every API route. It uses one D1
  database and one R2 bucket. The rest of this page covers this option.

> [!TIP]
> Almost everything is optional. Recording, sharing, the dashboard, and storage
> quotas all work with **just auth configured** — email is not required.

## What you're deploying

| Piece                | Tech                                                                             |
| -------------------- | -------------------------------------------------------------------------------- |
| Web app (`apps/web`) | Next.js 16, built for Workers via [OpenNext](https://opennext.js.org/cloudflare) |
| Database             | Cloudflare **D1** (`captureflow`)                                                |
| Object storage       | Cloudflare **R2** (`captureflow-recordings`)                                     |
| Auth                 | **Better Auth** (session secret)                                                 |
| Scheduled jobs       | Cron Triggers (hourly multipart GC + daily retention sweep)                      |
| Email (optional)     | Resend (workspace invites)                                                       |

The custom `worker.ts` wraps OpenNext's fetch handler and adds the `scheduled()`
cron handlers.

## Prerequisites

- A **Cloudflare account** with Workers + D1 + R2 enabled. (R2 requires a card on
  file even on the free tier.)
- A **domain** you control. The defaults assume `captureflow.dev`; you can use
  any domain by editing `apps/web/wrangler.jsonc`.
- **Node 24+** and **pnpm 10** (`packageManager` pins `pnpm@10.30.0`).
- `openssl` for generating the auth secret (preinstalled on macOS/Linux).

Install workspace dependencies from the repo root:

```bash
pnpm install
```

All deploy commands target the web app via `pnpm --filter @captureflow/web`, and
use the workspace-local copy of Wrangler — no global install needed.

## Running it as a company tool

Set `SELF_HOSTED` and `ALLOWED_EMAIL_DOMAINS` and the deployment becomes your
company's private recorder:

- Only people with a verified address on your domains can sign up.
- Storage has no default cap and nothing is deleted for being idle.
- There are no billing or upgrade screens, and the root URL goes to the login page.
- Recordings, comments, and workspaces live in your own D1 database and R2 bucket.

See [Private company instance](/self-hosting/configuration#private-company-instance).

## Cost expectations

The free tiers go a long way, but note these are **per Cloudflare account**, not
per domain:

- **R2:** 10 GB storage free, then usage-based.
- **D1:** 5 GB storage free, plus daily read/write row limits.
- **Workers:** 100k requests/day free.

For a video-heavy workload you'll typically hit R2 storage and operation limits
before anything else. See [Storage & limits](/reference/limits).

## Next steps

1. [Run with Docker](/self-hosting/docker), or [deploy to Cloudflare](/self-hosting/cloudflare) with the ordered runbook.
2. [Configuration & env](/self-hosting/configuration) — every variable explained.
3. [Point the desktop app at your backend](/self-hosting/desktop).
4. [Point the Chrome extension at your backend](/self-hosting/extension).
