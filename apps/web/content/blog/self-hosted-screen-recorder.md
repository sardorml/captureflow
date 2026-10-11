---
title: How to set up a self-hosted screen recorder
description: Step by step: run CaptureFlow, an open-source screen recorder, on your own Cloudflare account with sign-in limited to your company.
date: 2026-10-11
---

This guide sets up CaptureFlow, an open-source screen recorder, on your own Cloudflare account, so your team records and shares videos on a self-hosted tool your company owns. Recordings, comments and accounts stay in your Cloudflare account.

The examples use a made-up company, Acme, with the domain `acme.com`. Replace it with yours. The first setup takes about an hour or two.

## What you’re building

Everything runs on Cloudflare, and there are only three moving parts:

- **A Worker** runs the app itself: the dashboard, sign-in, the video player and every API route. It’s a Next.js app packaged for Cloudflare Workers.
- **A D1 database** keeps accounts, workspaces, comments and the list of recordings.
- **An R2 bucket** holds the actual videos and screenshots, and serves them to viewers from a domain of your own.

Two scheduled jobs run inside the same Worker. One cleans up half-finished uploads every hour and the other runs a daily retention sweep. You don’t need to set anything up for them; they deploy with the app.

By the end, Acme will have the app at `rec.acme.com`, videos served from `media.acme.com`, sign-in limited to people with an `@acme.com` Google account, and its own copies of the Chrome extension and the macOS app pointed at that domain.

## Before you start

You’ll need a few things in place:

- **A Cloudflare account.** The free plan is enough to start. R2 asks for a card on file even on the free tier, so add one under Billing before you begin.
- **A domain on that Cloudflare account.** Both the app and the video domain have to live on a zone in the same account. A subdomain of your company domain works well.
- **Node 24 or newer and pnpm 10.** If you have Node, run `corepack enable` and pnpm will pick up the version the repo pins.
- **A Google Workspace or GitHub organization** for your team, if you want to limit sign-in to your company.
- **A Mac with Xcode’s command line tools**, only if you want to build the desktop app.

Then grab the code and install its dependencies:

```bash
git clone https://github.com/sardorml/captureflow.git
cd captureflow
pnpm install
```

Every command from here on runs from the root of the repo. The web app brings its own copy of Wrangler, Cloudflare’s command line tool, so you don’t need to install it globally. You reach it through `pnpm --filter @captureflow/web exec wrangler`, which is a mouthful but saves you from version mismatches.

## Step 1: Log in to Cloudflare

Start by connecting Wrangler to your account. The first command opens a browser tab where you approve access, and the second confirms you’re signed in to the right account:

```bash
pnpm --filter @captureflow/web exec wrangler login
pnpm --filter @captureflow/web exec wrangler whoami
```

If you belong to more than one Cloudflare account, check that `whoami` shows the company one before going further. Everything you create next lands in that account.

## Step 2: Create the D1 database

CaptureFlow expects its database to be called `captureflow`, because that name is baked into the config and the migration scripts. Create it:

```bash
pnpm --filter @captureflow/web exec wrangler d1 create captureflow
```

Wrangler prints a block of config with a `database_id` in it. Open `apps/web/wrangler.jsonc`, find the `d1_databases` section, and paste that id over the placeholder:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "captureflow",
    "database_id": "paste-your-id-here"
  }
]
```

Now create the tables. This applies every migration in `apps/web/migrations` to the live database:

```bash
pnpm --filter @captureflow/web db:apply:remote
```

When you update CaptureFlow later, run this same command before deploying so the database picks up any new tables or columns.

## Step 3: Create the R2 storage bucket

Videos and screenshots go into an R2 bucket. Like the database, the name is fixed:

```bash
pnpm --filter @captureflow/web exec wrangler r2 bucket create captureflow-recordings
```

Viewers stream videos straight from R2, so the bucket needs a public domain. In the Cloudflare dashboard, open R2, pick `captureflow-recordings`, go to Settings, and under Public access connect a custom domain. Acme uses `media.acme.com`. Cloudflare creates the DNS record for you, and the domain is usually live within a minute or two.

## Step 4: Set the sign-in secret

CaptureFlow uses Better Auth for accounts and sessions, and it signs every session with a secret only your Worker knows. Generate a random one and store it in Cloudflare in a single line:

```bash
openssl rand -hex 32 | pnpm --filter @captureflow/web exec wrangler secret put BETTER_AUTH_SECRET
```

Secrets are stored encrypted on Cloudflare and never go in the repo. This one is the only setting the app can’t run without. If you ever rotate it, everyone gets signed out and simply signs in again.

## Step 5: Point the app at your domain

Out of the box, the config points at captureflow.dev. Open `apps/web/wrangler.jsonc` again and change the domain in two places. First, the route that tells Cloudflare which hostname serves the Worker:

```jsonc
"routes": [{ "pattern": "rec.acme.com", "custom_domain": true }]
```

Then the `vars` block, which holds the app’s public settings. Replace each captureflow.dev address with yours:

```jsonc
"vars": {
  "BETTER_AUTH_URL": "https://rec.acme.com",
  "APP_WEB_PUBLIC_URL": "https://rec.acme.com",
  "NEXT_PUBLIC_APP_WEB_SITE_URL": "https://rec.acme.com",
  "NEXT_PUBLIC_RECORDING_SITE_URL": "https://rec.acme.com",
  "NEXT_PUBLIC_SCREENSHOT_SITE_URL": "https://rec.acme.com",
  "NEXT_PUBLIC_MARKETING_SITE_URL": "https://rec.acme.com",
  "R2_PUBLIC_BASE_URL": "https://media.acme.com",
  "NEXT_PUBLIC_R2_PUBLIC_BASE_URL": "https://media.acme.com"
}
```

Leave the other entries in that block as they are. Anything starting with `NEXT_PUBLIC_` gets built into the JavaScript that browsers download, so never put a password or key behind one of those names. Real secrets always go through `wrangler secret put`.

## Step 6: Limit sign-in to your company

This step turns CaptureFlow from a public sign-up site into an internal tool. Add two more entries to the same `vars` block:

```jsonc
"SELF_HOSTED": "true",
"ALLOWED_EMAIL_DOMAINS": "acme.com"
```

`SELF_HOSTED` changes a handful of things at once. Storage has no default cap, so people are limited only by what you’re willing to pay R2 for. Recordings are never deleted for sitting idle. Pricing and upgrade screens disappear, and the public marketing pages send visitors straight to the login page.

`ALLOWED_EMAIL_DOMAINS` decides who can create an account. You can list more than one, separated by commas, like `acme.com,acme.io`. Sign-up then works only through Google or GitHub, because those providers have already verified that the person really owns the address. Someone typing an email and password could claim any address, so that path is closed for new accounts.

### Set up Google sign-in

If your company runs on Google Workspace, this is the smoothest option, since everyone already has an account. In the Google Cloud console:

1. Create a project, or pick an existing one.
2. Under APIs & Services, set up the OAuth consent screen. Choosing Internal limits it to your Workspace, which fits nicely.
3. Go to Credentials, create an OAuth client ID, and choose Web application.
4. Add `https://rec.acme.com/api/auth/callback/google` as an authorized redirect URI.

Google gives you a client ID and a client secret. Store both as secrets:

```bash
pnpm --filter @captureflow/web exec wrangler secret put GOOGLE_CLIENT_ID
pnpm --filter @captureflow/web exec wrangler secret put GOOGLE_CLIENT_SECRET
```

Each command asks you to paste the value. GitHub works the same way: create an OAuth app under your organization’s developer settings, use `https://rec.acme.com/api/auth/callback/github` as the callback URL, and store `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. The sign-in buttons show up on their own once the credentials are set.

### Invite emails, if you want them

Workspace invites can go out by email through Resend. It’s optional. Without it, CaptureFlow still creates the invite and you share the link yourself in Slack or wherever your team talks. To turn email on, verify your domain in Resend, then set `RESEND_API_KEY` as a secret and `RESEND_FROM_ADDRESS` to something like `Acme Recordings <rec@acme.com>`.

## Step 7: Deploy to Cloudflare Workers

With everything configured, one command builds and ships the app:

```bash
pnpm --filter @captureflow/web cf:deploy
```

It builds the Next.js app, packages it for Workers, and publishes it with the database, the bucket, your settings and the scheduled jobs attached. The first build takes a few minutes. When it finishes, Cloudflare connects `rec.acme.com` to the Worker and issues a certificate for it.

Then check that it all works:

1. Open `https://rec.acme.com`. You should land on the login page.
2. Sign in with a company Google account. Getting into the dashboard means the secret, the database and sign-in are all connected.
3. Try a personal Gmail address too. It should be turned away with a message saying sign-up is limited to your company.

If something looks off, stream the Worker’s logs while you click around:

```bash
pnpm --filter @captureflow/web exec wrangler tail captureflow-web
```

## Step 8: Build your Chrome extension

The Chrome extension is the fastest way for most people to record: click the icon, pick a tab or the whole screen, and the link is ready when you stop. The copy in the Chrome Web Store only talks to captureflow.dev, so you build your own pointed at your domain:

```bash
WXT_WEB_BASE=https://rec.acme.com pnpm --filter @captureflow/extension zip
```

That produces a zip under `apps/extension/.output`. The easiest way to get it to your team is the Chrome Web Store itself. Upload the zip as a new item from a developer account, and set its visibility to private for your Google Workspace domain. Only your company sees the listing, and Chrome keeps everyone updated automatically. If you manage Chrome through the Workspace admin console, you can also force-install it for everyone under Devices, Chrome, Apps & extensions.

Once the listing exists, it has a permanent extension ID, a long string of letters shown on the item page. The backend only hands sign-in tokens to that one extension, so add the ID to your `vars`. While you’re there, point the app’s “Get the extension” buttons at your private listing instead of the public one:

```jsonc
"CAPTUREFLOW_EXTENSION_ID": "your-extension-id"
```

```bash
NEXT_PUBLIC_CHROME_WEBSTORE_URL=https://chromewebstore.google.com/detail/your-extension-id \
  pnpm --filter @captureflow/web cf:deploy
```

`NEXT_PUBLIC_CHROME_WEBSTORE_URL` is read while the app builds, which is why it goes in front of the deploy command rather than into the config file.

> Just want to try it first? Run the same command with `build` instead of `zip`, open `chrome://extensions`, turn on Developer mode, and load the `apps/extension/.output/chrome-mv3` folder. An unpacked extension gets a different ID on every machine, so stick with the store listing for the whole team.

## Step 9: Build your macOS app

The macOS app lives in the menu bar, so people can record or grab an annotated screenshot without opening a browser first. It finds your backend through four settings that are baked in when it builds:

```bash
export CAPTUREFLOW_APP_WEB_API_BASE="https://rec.acme.com"
export CAPTUREFLOW_APP_WEB_BASE="https://rec.acme.com"
export CAPTUREFLOW_RECORDING_API_BASE="https://rec.acme.com/api/r"
export CAPTUREFLOW_SCREENSHOT_API_BASE="https://rec.acme.com/api/s"
```

To hand the app to other people, it has to be signed and notarized by Apple, or macOS will refuse to open it. That takes a paid Apple Developer account and a Developer ID Application certificate in your keychain. Store your notarization login once:

```bash
xcrun notarytool store-credentials captureflow-notary \
  --apple-id you@acme.com --team-id YOURTEAMID --password <app-specific-password>
```

Then build, in the same terminal where you exported the four settings above:

```bash
cd apps/desktop
APPLE_SIGNING_IDENTITY="Developer ID Application: Acme Inc (YOURTEAMID)" pnpm build:mac
```

The signed `.dmg` ends up in `apps/desktop/dist`. Share it however you share internal software, whether that’s a shared drive, an internal page, or your device management tool. When someone signs in from the app, the browser opens your login page and hands them back to the app once they’re in.

## Updates, costs and backups

Once it’s running, there’s very little to look after. A few things worth knowing:

- **Updating.** Pull the latest code, run `db:apply:remote` to bring the database up to date, then `cf:deploy` again.
- **Cost.** Cloudflare’s free tiers cover a small team for a while: 10 GB of R2 storage, 5 GB of D1, and 100,000 Worker requests a day. Video adds up faster than anything else, so R2 storage is the number to watch. Viewers downloading videos from R2 cost nothing extra, because Cloudflare doesn’t charge for egress.
- **Limits per person.** With `SELF_HOSTED` on, nobody has a cap by default. If one person needs a ceiling, you can set it for them from the admin app, which is a separate Worker covered in the [admin README](https://github.com/sardorml/captureflow/tree/main/apps/admin).
- **Your data stays yours.** Everything lives in your Cloudflare account. You can back up the database with Wrangler’s `d1 export` command, and the bucket is plain files you can copy anywhere.

Every setting is listed with its default in the [configuration reference](https://docs.captureflow.dev/self-hosting/configuration), and the [self-hosting docs](https://docs.captureflow.dev/self-hosting/overview) go deeper on each piece.

## Rather not do it yourself?

If an afternoon of Cloudflare dashboards isn’t how you want to spend your week, I can do it for you. I’ll set up the app, the storage, company sign-in, your private Chrome extension and the macOS app on your own Cloudflare account, then hand it over ready for your team to use. [Tell me what you need](/self-host-setup) and I’ll get back to you.

And if you hit a snag following this guide, open an issue on [GitHub](https://github.com/sardorml/captureflow). If one step tripped you up, it will probably trip up the next person too, and I’d rather fix the guide.
