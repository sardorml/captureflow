---
name: verify
description: Runtime-verify @captureflow/web changes by driving the dev server with Playwright
---

# Verify apps/web at runtime

## Launch

- Dev server: `pnpm --filter @captureflow/web dev` → http://localhost:3032.
  Check `lsof -nP -iTCP:3032 -sTCP:LISTEN` first — the user often has it
  running already (`EADDRINUSE`); drive the existing instance, never kill it.
  `next dev` hot-picks-up file changes, including new route files.

## Drive (Playwright)

- No Playwright in the repo. Install in the scratchpad: `npm i playwright@latest`,
  then confirm the chromium revision in `node_modules/playwright-core/browsers.json`
  exists under `~/Library/Caches/ms-playwright/` (pick the playwright version that
  matches the cache; do not download browsers).
- Public surfaces: `/` (marketing), `/login`, `/download`, `/r/[id]`, `/s/[id]`.
- `/signup` redirects to `/login?mode=signup` (signup is a mode of the login page).
- Dashboard needs a session. Create a throwaway account on the local D1:
  on `/login?mode=signup` click "Continue with email", fill `#name`, `#email`
  (`verify-<rand>@example.com`), `#password` (≥12 chars), submit
  "Create account" → lands on `/recordings`.
- Dashboard chrome selectors: `.ant-layout-sider` (sidebar), sidebar links are
  plain `a[href="/settings"]` etc.

## Gotchas

- NEVER run `pnpm --filter @captureflow/web build` while a dev server is
  running: the production build writes into the same `.next` the dev server
  serves from and corrupts its Turbopack cache — the watcher goes stale and
  every edit after that silently serves old output until the dev server is
  restarted (ideally after `rm -rf apps/web/.next`).

- `<nextjs-portal>` is always mounted in dev — its presence is not an error
  overlay; listen for `pageerror` instead.
- Local dev D1 is seeded via `pnpm --filter @captureflow/web db:seed:local`;
  throwaway signups persist in it (harmless).
