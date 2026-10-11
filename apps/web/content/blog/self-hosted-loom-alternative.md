---
title: A self-hosted Loom alternative for companies that keeps video in-house
description: Run CaptureFlow on your company's own Cloudflare account. Your recordings stay on your infrastructure, nobody pays per seat, and we can set it all up for you.
date: 2026-10-11
---

Screen recordings show a lot: customer accounts, internal dashboards, unreleased features, code. With Loom, all of that sits on someone else’s servers, and you pay $18 to $24 a month for every person who records it.

CaptureFlow is an open-source Loom alternative that your company can run on its own Cloudflare account. Your team records and shares videos the same way, but every recording stays in storage you own, and the cost doesn’t grow with headcount.

## Why companies self-host their screen recorder

**Your videos stay on your infrastructure.** Recordings live in your own Cloudflare R2 bucket, and accounts and comments live in your own database. Nothing passes through a third-party video service.

**Only your company can sign in.** Sign-up is limited to your email domain through Google Workspace or GitHub, so only people with a verified company address get in.

**Security reviews get shorter.** There’s no new vendor holding your data, and the code is open source, so your security team can read exactly what runs.

**You set the rules.** No storage caps and no automatic deletion unless you want them. You decide how long recordings are kept.

**The cost stays flat.** You pay Cloudflare for storage, not anyone per person. Adding a new hire costs nothing.

## What it costs compared to Loom

Self-hosted CaptureFlow runs on three Cloudflare services:

- **Workers** runs the app, on the $5 a month paid plan.
- **R2** stores the videos. The first 10 GB are free, then it’s $0.015 per GB each month. Watching videos costs nothing, because R2 doesn’t charge for bandwidth.
- **D1** stores accounts and comments, inside its free 5 GB.

Assume a heavy year: every person records 10 videos a month at around 100 MB each, and nothing is ever deleted. Here’s the first year:

| Team size  | Self-hosted CaptureFlow | Loom Business |
| ---------- | ----------------------- | ------------- |
| 10 people  | about $70               | $2,160        |
| 25 people  | about $90               | $5,400        |
| 50 people  | about $120              | $10,800       |
| 100 people | about $175              | $21,600       |

A 100-person company keeps 1.2 TB of video by the end of that year and still pays under $200. The second year costs a little more as storage builds up, about $225 for a 50-person team, which is still around 2% of the Loom bill.

## What your team gets

Everyone records and shares the way they’re used to:

- Record a screen, a tab or a camera from the Chrome extension or the macOS app.
- Get a share link the moment the recording stops.
- Viewers watch in the browser, comment and react right on the video.
- See who watched, and organize videos into shared workspaces.
- Share annotated screenshots with arrows, text and blur.

Everything runs on your own domain, like `rec.yourcompany.com`, so links look like your company’s, not a vendor’s.

## We can set it up for you

Running it yourself means creating a Cloudflare database and storage bucket, configuring company sign-in, building and publishing a private Chrome extension, and signing a macOS app. It’s all documented, but it takes time, and most companies would rather not spend an engineer’s week on it.

So we offer it as a service. We set up the whole thing on your own Cloudflare account:

- **The app, on your infrastructure.** Deployed to your Cloudflare account and served from your domain. You own all of it.
- **Storage and database.** Recordings in your own R2 bucket, workspaces and comments in your own database.
- **Company-only sign-in.** Google Workspace or GitHub sign-in, limited to your company’s email domain.
- **Chrome extension and Mac app.** Both built for your instance, with the extension published privately for your team.
- **Ready to record.** Workspaces created and your team invited, so people can start sharing right away.
- **Handover.** We walk whoever maintains it through running and updating it.

Everything runs on your account, and nothing depends on us afterward. If you ever stop working with us, the setup keeps running exactly as it is.

[Tell us about your company](/self-host-setup) and we’ll get back to you.

## Prefer to do it yourself?

The full setup is open and documented. Follow the [step-by-step self-hosting guide](/blog/self-host-captureflow), which takes about an hour or two if you’re comfortable in a terminal.

## What Loom has that CaptureFlow doesn’t

To be fair about the trade-offs:

- **Transcripts and captions** aren’t in CaptureFlow yet.
- **AI titles, summaries and chapters** come with Loom Business + AI. CaptureFlow chapters are manual.
- **Apps:** Loom also has Windows, iOS and Android apps.
- **SAML single sign-on** isn’t supported. Sign-in is through Google or GitHub, limited to your domain.

For most internal recording, such as walkthroughs, bug reports, demos, onboarding and async updates, none of these get in the way.

## Frequently asked questions

### Can Loom be self-hosted?

No. Loom only runs as a hosted service, so your videos are always stored on Loom’s servers. CaptureFlow is an open-source alternative that you can host on your own Cloudflare account.

### Where are the videos stored when we self-host?

In a Cloudflare R2 bucket on your own Cloudflare account. Accounts, workspaces and comments are stored in a Cloudflare D1 database on the same account. No video or data passes through CaptureFlow’s servers.

### How long does the setup take?

Doing it yourself takes about an hour or two for someone comfortable with a terminal, plus time to publish the Chrome extension and sign the Mac app. If we set it up for you, your team can start recording as soon as it’s handed over.

### What happens if we stop working with you?

Nothing changes. Everything runs on your Cloudflare account, and the code is open source, so you can keep running and updating it on your own.
