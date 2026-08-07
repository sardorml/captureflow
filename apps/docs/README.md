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

```bash
pnpm --filter @captureflow/docs cf:deploy
```

Builds the site and publishes it as an assets-only Cloudflare Worker
(`captureflow-docs`, see `wrangler.jsonc`) — there is no `main`, so Cloudflare's
asset server answers every request straight from `.vitepress/dist`. The hostname
is a Workers custom domain, so Cloudflare creates and manages its DNS record.

Independent of the app worker in both directions: a docs change never rebuilds
or republishes the app, and a failing app build never blocks a docs update.
