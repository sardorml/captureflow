# FAQ

## Is CaptureFlow really free and open source?

Yes — it's [AGPL-3.0-only](https://github.com/sardorml/captureflow/blob/main/LICENSE)
and fully self-hostable. **Every feature ships in the open-source build.** There
is an optional managed-hosting tier for people who'd rather not run their own
infrastructure, but it doesn't unlock any extra features — it's just hosting.

## Do viewers need an account to watch?

No, not for **public** recordings — they play in any browser. **Private** and
**workspace** recordings require the viewer to sign in (or request access). See
[Sharing & visibility](/guide/sharing#visibility).

## What platforms does the recorder run on?

The recorder is **macOS** today (Apple Silicon and Intel) — it uses native macOS
capture APIs. The dashboard and share/screenshot pages are **cross-platform** and work
in any modern browser on any OS.

## Where are my recordings stored?

On a self-hosted instance, in **your** Cloudflare account: video/poster/screenshot
files in **R2**, metadata in **D1**. Nothing goes to a third party you didn't
configure.

## How is the share link ready so fast?

The recording uploads **while you record** (a streaming multipart upload), so by
the time you stop, the bytes are already in storage and only a quick finalize
step remains. See [How it works](/guide/how-it-works).

## Can I use my own domain?

Yes. The defaults assume `captureflow.xyz`, but you can point the Worker and CDN
at any domain you control — edit the vars in `apps/web/wrangler.jsonc`. See
[Deploy to Cloudflare](/self-hosting/cloudflare).

## What's a "screenshot"?

A screenshot that shares exactly like a recording — capture, get an instant link,
done. See [Screenshots](/guide/screenshots).

## Do I need a Cloudflare paid plan?

Not to start. The free tiers cover light usage, though R2 requires a card on file
even on the free tier, and a video-heavy workload will reach R2 limits first. See
[Storage & limits](/reference/limits).

## How do I self-host it?

Follow [Self-Hosting → Overview](/self-hosting/overview) and the
[Deploy to Cloudflare](/self-hosting/cloudflare) runbook. The only required
secret is `BETTER_AUTH_SECRET`.

## How do I contribute?

See [Contributing](/developer/contributing).
