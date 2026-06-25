# What is CaptureFlow?

**CaptureFlow is open-source, self-hostable screen recording with instant
shareable links.** Think of it as a Loom-style workflow you fully own: a native
screen recorder on your machine, plus a Cloudflare-hosted dashboard and share
pages that you can run on your own account.

The loop is deliberately short:

1. **Record** your screen (full screen, a window, or a region) with the desktop
   app.
2. **Get a link** — the video uploads while you record, so a shareable URL is
   ready the moment you hit stop.
3. **Share it** — paste the link anywhere. Viewers watch in the browser, no
   install required.

## Open source, not feature-gated

CaptureFlow is licensed under [AGPL-3.0](https://github.com/sardorml/captureflow/blob/main/LICENSE)
and is fully self-hostable on your own Cloudflare account. **Every feature ships
in the open-source build** — there's nothing gated behind a paywall. An optional
managed-hosting option exists for people who'd rather not run their own
infrastructure, but it's just hosting, not a feature unlock.

## What you get

- **A native recorder** — full-screen, window, and region capture with an
  optional webcam bubble and a smoothed cursor. (macOS today; see
  [Install the app](/guide/install).)
- **Instant share links** — streaming upload means the link is ready on stop.
- **A share viewer** — plays in any browser, with reactions, comments, view
  counts, and auto-generated summary chapters.
- **Screenshots** — annotated images that share exactly like recordings.
- **A dashboard** — manage your recordings and screenshots, set visibility, invite
  teammates into a workspace, and track storage usage.
- **A backend you control** — Next.js on Cloudflare Workers, backed by D1 and
  R2, with built-in storage quotas and retention.

## Who it's for

- **Individuals** who want a fast, private Loom alternative they own end to end.
- **Teams** who need workspace sharing without sending recordings to a
  third-party SaaS.
- **Self-hosters & tinkerers** who want the whole stack on their own Cloudflare
  account.

## Where to go next

- New here? Start with [How it works](/guide/how-it-works), then
  [Install the app](/guide/install).
- Want to run your own instance? Jump to
  [Self-Hosting → Overview](/self-hosting/overview).
- Want to build or contribute? See [Architecture](/developer/architecture).
