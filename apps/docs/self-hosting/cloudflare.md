# Deploy to Cloudflare

A turnkey, ordered runbook for provisioning and deploying the CaptureFlow web
backend (`apps/web`) to your own Cloudflare account. Every command runs **from
the repo root**.

> This mirrors [`DEPLOY.md`](https://github.com/sardorml/captureflow/blob/main/DEPLOY.md)
> in the repo, which is the canonical source if the two ever drift.

## 1. Log in to Cloudflare

```bash
pnpm --filter @captureflow/web exec wrangler login
pnpm --filter @captureflow/web exec wrangler whoami   # confirm
```

## 2. Create the D1 database

The name **must** be `captureflow` — it matches `wrangler.jsonc` and the `db:*`
scripts.

```bash
pnpm --filter @captureflow/web exec wrangler d1 create captureflow
```

Wrangler prints a `database_id`. Paste it into **`apps/web/wrangler.jsonc`** →
`d1_databases[0].database_id`, replacing the placeholder. Then apply migrations
to the remote database:

```bash
pnpm --filter @captureflow/web db:apply:remote
```

(That runs `wrangler d1 migrations apply captureflow --remote`; migrations live
in `apps/web/migrations/`.)

## 3. Create the R2 bucket

The name **must** be `captureflow-recordings`.

```bash
pnpm --filter @captureflow/web exec wrangler r2 bucket create captureflow-recordings
```

Prefixes used inside the bucket: `videos/`, `posters/`, `screenshots/`.

## 4. Set secrets

Secrets are **never** stored in `wrangler.jsonc`. The only required one is the
auth secret:

```bash
openssl rand -hex 32 | pnpm --filter @captureflow/web exec wrangler secret put BETTER_AUTH_SECRET
```

An optional email (Resend) secret for workspace invites is covered in
[Configuration & env](/self-hosting/configuration). Skip it to run with
invite-emails disabled (invite links can still be shared manually).

## 5. Review public vars

The non-secret `vars` already live in `apps/web/wrangler.jsonc`. If you use a
domain other than `captureflow.xyz`, update them now (`NEXT_PUBLIC_*` site URLs,
`R2_PUBLIC_BASE_URL`, `BETTER_AUTH_URL`, `APP_DEEP_LINK_SCHEME`). Full table in
[Configuration & env](/self-hosting/configuration).

> [!WARNING]
> `NEXT_PUBLIC_*` vars are inlined into the client bundle at build time — they
> are public by design. **Never** put a secret behind a `NEXT_PUBLIC_` name.

## 6. Bind your domain(s)

- **`captureflow.xyz`** → the `captureflow-web` Worker. Add a custom domain in
  the dashboard (Workers & Pages → `captureflow-web` → Domains & Routes), or add
  `routes` to `wrangler.jsonc`:

  ```jsonc
  "routes": [{ "pattern": "captureflow.xyz", "custom_domain": true }]
  ```

- **`cdn.captureflow.xyz`** → the `captureflow-recordings` bucket's public
  access (R2 → bucket → Settings → Public access → connect custom domain). This
  must match `R2_PUBLIC_BASE_URL`.

Both domains must be on a zone in the same Cloudflare account.

## 7. Deploy

```bash
pnpm --filter @captureflow/web cf:deploy
```

This chains `opennextjs-cloudflare build` → `opennextjs-cloudflare deploy`:
builds Next.js, packages it through `worker.ts` (which adds the cron handlers),
and publishes the Worker with its D1/R2 bindings, vars, and cron triggers.

> [!TIP]
> Validate locally first with `pnpm --filter @captureflow/web cf:preview`, which
> builds and serves the Worker against your `.dev.vars` and local D1.

## 8. Verify

1. Open your domain — the dashboard/landing should load.
2. Sign up / log in — confirms `BETTER_AUTH_SECRET` + D1 are wired.
3. Tail logs: `pnpm --filter @captureflow/web exec wrangler tail captureflow-web`.
4. Record + recording from the desktop app and confirm the link resolves and the
   video plays from your CDN domain (confirms R2 + CDN).

## 9. Point the desktop app at your backend

If you self-host on `captureflow.xyz`, nothing to do. For any other host, see
[Point the desktop app at your backend](/self-hosting/desktop).
