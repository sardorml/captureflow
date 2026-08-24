# @captureflow/admin-app

The instance-admin service — a separate Worker from `apps/web`, deployed to
`admin.captureflow.dev`, bound to the same D1 database and R2 bucket. Its own
host, so the admin session cookie never rides along with a request to the app.

Admins are **not** product accounts. An admin is whoever operates the Cloudflare
deployment; `admin_users` and `users` never join, and a row in one grants nothing
in the other.

## Roles

| Role     | Can                                                |
| -------- | -------------------------------------------------- |
| `owner`  | Everything, including inviting and removing admins |
| `admin`  | View users and change their quota overrides        |
| `viewer` | Read-only access to users and the audit log        |

Only owners manage admins, and nobody can change or remove their own account —
that is what keeps a deployment from ending up with no owner.

## Secrets

```sh
wrangler secret put ADMIN_SESSION_SECRET   # signs the admin session cookie
wrangler secret put ADMIN_SETUP_TOKEN      # gates the one-time first-run claim
wrangler secret put RESEND_API_KEY         # optional; mails invites
```

The setup token proves you control the deployment, so a stranger who finds the
host on a fresh install cannot claim it. Two ways to produce one:

- **Set `ADMIN_SETUP_TOKEN`** and paste that value at setup.
- **Press "Generate a setup token"** on the setup page. The deployment mints one
  itself, stores only its hash, and writes the raw value to the server log —
  `wrangler tail` when deployed, the dev-server terminal locally. Valid 30
  minutes, single-use, and every unused one is deleted the moment an owner
  exists. In dev the value is shown on the page too, since the log and the
  browser are the same person there.

Setup closes permanently once an owner exists; after that, admins arrive only by
invite. A rejected token reports the character counts it saw (`received 13,
expected 17`) outside production, so a mismatch is diagnosable rather than a
dead end.

## First run

1. Deploy, then open `https://admin.captureflow.dev`.
2. Paste the setup token, pick an email and password → you are the owner.
3. Invite the rest from **Admins**. Each invite is a single-use link that expires
   in 7 days; only its hash is stored. Without `RESEND_API_KEY` the link is shown
   to you instead of emailed.

## Local development

```sh
pnpm --filter @captureflow/admin-app dev   # http://localhost:3034
```

Secrets come from `apps/admin/.dev.vars` (gitignored). Paths match the deployed
host one-for-one — there is no path prefix in either environment.

Dev reads `apps/web/.wrangler/state/v3` rather than its own miniflare state, so
you administer the same local database the web app is writing — the schema and
its migrations live over there. Point `CF_DEV_STATE` elsewhere to override. If
that directory has no schema yet, run `pnpm --filter @captureflow/web
db:seed:local`.

If miniflare refuses to start with a `_cf_ALARM has 3 columns` error, the state
was written by a newer Wrangler than this workspace pins. Delete every
`<state>/v3/*/*/metadata.sqlite*` — they hold Durable Object alarms, which none
of these bindings use — and reload.
