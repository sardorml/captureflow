# @captureflow/docs

The CaptureFlow documentation site, built with [VitePress](https://vitepress.dev).

## Develop

```bash
pnpm --filter @captureflow/docs dev       # local dev server with hot reload
pnpm --filter @captureflow/docs build     # static build → .vitepress/dist
pnpm --filter @captureflow/docs preview    # serve the production build locally
```

## Structure

```
.vitepress/config.ts   Site config: nav, sidebar, theme, search
index.md               Home (hero) page
guide/                 Introduction + Getting Started
self-hosting/          Cloudflare deploy + configuration
developer/             Architecture, build, contributing
reference/             Limits, troubleshooting, FAQ
public/                Static assets (logo, favicon)
```

Content is plain Markdown. Add a page by creating a `.md` file and linking it in
the `sidebar` in `.vitepress/config.ts`.

## Deploy

This site has no deployment of its own. `pnpm --filter @captureflow/web
cf:deploy` builds it into `apps/web/public/docs` first, so it ships inside the
worker's assets and `apps/web/worker.ts` serves it from the root of the
hostname in that worker's `DOCS_HOST` var.
