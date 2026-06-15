# CaptureFlow

**Open-source, self-hostable screen recording with instant shareable links.**

CaptureFlow is a native screen recorder plus a Cloudflare-hosted dashboard:
record your screen, get an instant share link, done. It's fully open source
(AGPL-3.0) and self-hostable on your own Cloudflare account. A managed-hosting
tier is available for people who'd rather not run their own infra — but
**every feature ships in the open-source build**. The subscription pays for
managed hosting, not a feature gate.

## Monorepo layout

```
apps/
  web/        Next.js 16 dashboard + share pages + API → Cloudflare Workers (OpenNext)
  desktop/    Electron screen recorder
packages/
  shared/     Types & constants shared by web + desktop
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
