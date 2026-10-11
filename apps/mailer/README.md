# @captureflow/mailer

Sends product email to every CaptureFlow account. A separate Worker from
`apps/web`, bound to the same D1 database.

- Emails are written, previewed and test-sent in the admin panel (**Emails**,
  owners only). Sending puts the first page of recipients on the
  `captureflow-mail` queue.
- This Worker consumes the queue one page at a time: 100 recipients, one Resend
  batch request, then the next page. Each address a campaign reaches is recorded
  in `mail_deliveries`, so a retried page never emails anyone twice.
- `mail.captureflow.dev/unsubscribe` handles the link in every email's footer
  and the one-click `List-Unsubscribe` request from mail clients. Opt-outs live
  in `mail_unsubscribes`, keyed by address.

Each email goes to **everyone** (`users` minus `mail_unsubscribes`, read at
send time, so later signups are included) or to **people picked** in the
composer (`mail_campaign_recipients`, minus the same unsubscribes). The list
never leaves D1: Resend only receives each email as it is sent.

## Setup

1. **Queue:** `pnpm --filter @captureflow/mailer exec wrangler queues create captureflow-mail`
2. **A Resend key for this Worker only.** In Resend → API Keys, create a key
   with **Sending access** restricted to the `captureflow.dev` domain. Don't
   reuse the web app's key or a full-access key: this one can then send only as
   captureflow.dev and can't read or change anything else in the Resend account.
3. **Secrets:**

   ```sh
   cd apps/mailer
   wrangler secret put RESEND_API_KEY            # the scoped key from step 2
   wrangler secret put MAIL_UNSUBSCRIBE_SECRET   # openssl rand -base64 32
   ```

   Rotating `MAIL_UNSUBSCRIBE_SECRET` breaks the unsubscribe links in every
   email already sent, so set it once.

4. **Deploy:** CI deploys it on merge to `main`, after the web worker has
   applied migrations. `mail.captureflow.dev` is a custom domain, so Cloudflare
   creates the DNS record.

`MAIL_FROM` and `MAILER_BASE_URL` are plain vars in `wrangler.jsonc`.

## Local development

```sh
cp .dev.vars.example .dev.vars
pnpm --filter @captureflow/mailer exec wrangler dev --persist-to ../web/.wrangler/state
```

`--persist-to` points it at the web app's local database. The admin panel's
local queue doesn't reach this process, so local sends are covered by the
tests (`pnpm --filter @captureflow/mailer test`), not by clicking.
