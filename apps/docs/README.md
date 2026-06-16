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

## Deploy (Cloudflare Pages)

```bash
pnpm --filter @captureflow/docs cf:deploy
```

This builds the site and runs `wrangler pages deploy .vitepress/dist
--project-name captureflow-docs`. Create the Pages project once in the Cloudflare
dashboard (or on first deploy), then point a custom domain (e.g.
`docs.captureflow.xyz`) at it.
