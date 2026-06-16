# Build from source

## Prerequisites

- **Node.js ≥ 24.13**
- **pnpm 10** — `corepack enable && corepack prepare pnpm@10.30.0 --activate`
- For the desktop app: **macOS** (the recorder uses native macOS capture
  helpers).
- For the web app: a **Cloudflare account** to deploy (not needed just to run
  the dev server).

## Install

```bash
pnpm install
```

## Run everything

The monorepo is orchestrated with Nx:

```bash
pnpm dev          # nx run-many -t dev  (all apps)
pnpm build        # nx run-many -t build
pnpm lint         # nx run-many -t lint
pnpm typecheck    # nx run-many -t typecheck
pnpm graph        # open the Nx project graph
```

## Run a single app

```bash
pnpm --filter @captureflow/web dev        # dashboard + API on http://localhost:3032
pnpm --filter @captureflow/desktop dev    # the Electron recorder
pnpm --filter @captureflow/docs dev       # these docs
```

## Web app specifics

```bash
pnpm --filter @captureflow/web db:seed:local   # seed local D1 from the schema snapshot
pnpm --filter @captureflow/web dev             # Next.js dev server (:3032)
pnpm --filter @captureflow/web cf:preview      # build + run the Worker locally
pnpm --filter @captureflow/web cf:deploy       # build + deploy to Cloudflare
```

Local secrets go in `apps/web/.dev.vars` (copy `.dev.vars.example`). See
[Configuration & env](/self-hosting/configuration).

## Desktop app specifics

```bash
pnpm --filter @captureflow/desktop dev      # dev (points at http://localhost:3032)
pnpm --filter @captureflow/desktop build    # packaged build via electron-vite
```

Backend URLs are inlined at build time — see
[Point the desktop app at your backend](/self-hosting/desktop).

## Build these docs

```bash
pnpm --filter @captureflow/docs build       # static site → apps/docs/.vitepress/dist
pnpm --filter @captureflow/docs preview      # serve the built site locally
```

Next: [Contributing](/developer/contributing).
