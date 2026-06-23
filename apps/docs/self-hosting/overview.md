# Self-hosting overview

CaptureFlow's backend is designed to run on **your own Cloudflare account**. One
unified Worker serves the dashboard, auth, the share viewer, the snap viewer, and
all API routes, backed by a single D1 database and a single R2 bucket.

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
- A **domain** you control. The defaults assume `captureflow.xyz`; you can use
  any domain by editing `apps/web/wrangler.jsonc`.
- **Node 24+** and **pnpm 10** (`packageManager` pins `pnpm@10.30.0`).
- `openssl` for generating the auth secret (preinstalled on macOS/Linux).

Install workspace dependencies from the repo root:

```bash
pnpm install
```

All deploy commands target the web app via `pnpm --filter @captureflow/web`, and
use the workspace-local copy of Wrangler — no global install needed.

## Cost expectations

The free tiers go a long way, but note these are **per Cloudflare account**, not
per domain:

- **R2:** 10 GB storage free, then usage-based.
- **D1:** 5 GB storage free, plus daily read/write row limits.
- **Workers:** 100k requests/day free.

For a video-heavy workload you'll typically hit R2 storage and operation limits
before anything else. See [Storage & limits](/reference/limits).

## Next steps

1. [Deploy to Cloudflare](/self-hosting/cloudflare) — the ordered runbook.
2. [Configuration & env](/self-hosting/configuration) — every variable explained.
3. [Point the desktop app at your backend](/self-hosting/desktop).
