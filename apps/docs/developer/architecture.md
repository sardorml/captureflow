# Architecture

CaptureFlow is a **pnpm + Nx monorepo**. Two apps, three shared packages, plus
this docs site.

## Repo layout

```
apps/
  web/        Next.js 16 dashboard + share/snap pages + API → Cloudflare Workers (OpenNext)
  desktop/    Electron screen recorder (macOS native helpers)
  docs/       This VitePress documentation site
packages/
  shared/     Types & constants shared by web + desktop
  ui/         Shared React UI components + design tokens
  quota/      Storage quota, limits & workspace logic
```

Tooling:

- **pnpm 10** workspaces (`apps/*`, `packages/*`) with a dependency `catalog`
  for pinning React/TypeScript/Node types.
- **Nx 22** for task running and caching (`nx run-many -t build|dev|lint|typecheck`).
- **Node 24+**.

## The web app (`apps/web`)

- **Next.js 16** (App Router), deployed to **Cloudflare Workers** via
  [OpenNext](https://opennext.js.org/cloudflare). A custom `worker.ts` re-exports
  OpenNext's fetch handler and adds the cron `scheduled()` handlers.
- **Better Auth** for sessions (Drizzle adapter).
- **Drizzle ORM** over **D1** (SQLite). Migrations in `apps/web/migrations/`.
- **R2** for video/poster/snap objects (`videos/`, `posters/`, `snaps/`).
- Route groups: the dashboard (`app/(dashboard)`), the share viewer (`app/r/[id]`),
  the snap viewer (`app/s/[id]`), auth, and API routes under `app/api/`
  (`/api/r/*` for recordings, `/api/s/*` for snaps).
- Cron triggers: hourly multipart-upload GC and a daily retention sweep.

## The desktop app (`apps/desktop`)

- **Electron** + **electron-vite**, React renderer, Zustand stores, Tailwind.
- **Native macOS helpers** (Swift) under `native/`: `screen-recorder`,
  `cursor-monitor`, `window-detector` — invoked from the main process for
  capture, cursor tracking, and window detection.
- A streaming **share pipeline** that uploads the recording in parts while you
  record, then finalizes for an instant link.
- Webcam compositing, smoothed cursor rendering, and snap capture.

## Shared packages

| Package | Responsibility |
| --- | --- |
| `@captureflow/shared` | Types and constants used by both web and desktop. |
| `@captureflow/ui` | Reusable React components, design tokens, theming. |
| `@captureflow/quota` | Storage limits, per-user quotas, and workspace math. |

## Data model at a glance

- **D1** holds users, workspaces & members, recordings (shares), snaps,
  reactions, comments, and quotas.
- **R2** holds the binary objects, read publicly over your CDN domain.
- **Better Auth** sessions are signed, not stored in plaintext.

Next: [Build from source](/developer/build).
