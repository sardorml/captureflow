<div align="center">
  <img src="apps/web/public/logo.png?v=4" width="112" alt="CaptureFlow" />
  <h1>CaptureFlow</h1>
  <p>
    <strong>Open-source, self-hostable screen recording with instant shareable links.</strong>
  </p>
  <p>
    <a href="https://captureflow.xyz">Website</a>
    &nbsp;·&nbsp;
    <a href="https://github.com/sardorml/captureflow/releases">Download</a>
    &nbsp;·&nbsp;
    <a href="https://docs.captureflow.xyz">Docs</a>
    &nbsp;·&nbsp;
    <a href="./DEPLOY.md">Self-hosting</a>
    &nbsp;·&nbsp;
    <a href="./LICENSE">License</a>
  </p>
  <p>
    <a href="./LICENSE"><img alt="License: AGPL-3.0" src="https://img.shields.io/badge/license-AGPL--3.0-2563EB.svg" /></a>
    <img alt="Platform: macOS" src="https://img.shields.io/badge/platform-macOS-111111.svg" />
    <a href="https://github.com/sardorml/captureflow/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/sardorml/captureflow?color=2563EB" /></a>
  </p>
  <br />
  <img src="apps/web/public/og-image.png?v=4" alt="CaptureFlow — screen recording with instant shareable links" width="100%" />
</div>

<br />

CaptureFlow is a native macOS screen recorder plus a Cloudflare-hosted dashboard
and share pages: record your screen, get an instant link, done. It's fully open
source (AGPL-3.0) and self-hostable on your own Cloudflare account — **every
feature ships in the open-source build**.

## Monorepo layout

```
apps/
  web/        Next.js 16 dashboard + recording/screenshot pages + API → Cloudflare Workers (OpenNext)
  desktop/    Electron screen recorder (macOS)
  docs/       VitePress documentation site
packages/
  shared/     Types & constants shared by web + desktop
  ui/         Shared React UI components + design tokens
  quota/      Storage quota, limits & workspace logic
```

## Requirements

- Node.js >= 24.13
- pnpm 10 (`corepack enable && corepack prepare pnpm@10.30.0 --activate`)
- A Cloudflare account for the web app (Workers + R2 + D1 + KV)

## Develop

```bash
pnpm install
pnpm dev                                  # run everything
pnpm --filter @captureflow/web dev        # just the dashboard
pnpm --filter @captureflow/desktop dev    # just the recorder
```

## Deploy the web app to Cloudflare

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sardorml/captureflow)

Or manually:

```bash
# one-time: create the bindings
wrangler d1 create captureflow
wrangler r2 bucket create captureflow-recordings
wrangler kv namespace create KV
# paste the returned ids into apps/web/wrangler.jsonc, then:
pnpm --filter @captureflow/web cf:deploy
```

## License

[AGPL-3.0-only](./LICENSE). Contributions require signing the [CLA](./CLA.md).
