# Architecture

CaptureFlow is a **pnpm + Nx monorepo**. Two apps, three shared packages, plus
this docs site.

## Repo layout

```
apps/
  web/        Next.js 16 dashboard + share/screenshot pages + API → Cloudflare Workers (OpenNext)
  desktop/    Electron screen recorder (macOS)
  extension/  WXT/MV3 browser screen recorder (Chromium)
  docs/       This VitePress documentation site
packages/
  engine/     MIT-licensed capture engine (macOS sidecars + recording pipelines)
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
- **R2** for video/poster/screenshot objects (`videos/`, `posters/`, `screenshots/`).
- Route groups: the dashboard (`app/(dashboard)`), the share viewer (`app/r/[id]`),
  the screenshot viewer (`app/s/[id]`), auth, and API routes under `app/api/`
  (`/api/r/*` for recordings, `/api/s/*` for screenshots).
- Cron triggers: hourly multipart-upload GC and a daily retention sweep.

## The desktop app (`apps/desktop`)

- **Electron** + **electron-vite**, React renderer, Zustand stores, Tailwind.
- Capture runs through **`@captureflow/engine`**: native macOS sidecars (Swift)
  under `packages/engine/native/mac/` — `screen-recorder` and
  `window-detector` — invoked from the main process for capture and window
  detection. Recordings include the system cursor in-frame.
- A streaming **share pipeline** that uploads the recording in parts while you
  record, then finalizes for an instant link.
- Webcam capture and screenshot capture.

## The capture engine (`packages/engine`)

The MIT-licensed engine owns everything between "the OS hands us media" and a
consistent, uploadable recording: the macOS sidecars and their record
protocol, and the browser-side recording pipelines (fragmented-MP4 muxer,
native-record pipeline, `VideoEncoder` stream recorder, webcam recorder).
Desktop and the browser extension both record through it, so their output is
identical: fragmented MP4 (H.264) screen video, WebM webcam, JPEG poster. See
`packages/engine/README.md` for the API map and the record protocol spec.

## Shared packages

| Package               | Responsibility                                           |
| --------------------- | -------------------------------------------------------- |
| `@captureflow/engine` | MIT-licensed capture engine used by desktop + extension. |
| `@captureflow/shared` | Types and constants used by both web and desktop.        |
| `@captureflow/ui`     | Reusable React components, design tokens, theming.       |
| `@captureflow/quota`  | Storage limits, per-user quotas, and workspace math.     |

## Data model at a glance

- **D1** holds users, workspaces & members, recordings, screenshots,
  reactions, comments, and quotas.
- **R2** holds the binary objects, read publicly over your CDN domain.
- **Better Auth** sessions are signed, not stored in plaintext.

Next: [Build from source](/developer/build).
