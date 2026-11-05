# Run with Docker

The Docker images run CaptureFlow on any machine with Docker: a home server, a
NAS or a VPS. You don't need a Cloudflare account. Everything is stored in one
`data/` folder: a SQLite database, the recordings, and the secrets generated on
first start. One login covers everything: administrators get an Admin page at
`<APP_URL>/admin`.

| Piece                | In Docker                                                  |
| -------------------- | ---------------------------------------------------------- |
| Web app (`apps/web`) | `ghcr.io/sardorml/captureflow`, port 3000                  |
| Database             | SQLite, `data/captureflow.sqlite`                          |
| Recordings           | Files under `data/storage/`, served at `<APP_URL>/media/…` |
| Scheduled jobs       | Run inside the web container (same schedule as Cloudflare) |
| Transcripts          | Optional: any OpenAI-compatible Whisper server             |
| Email                | Optional: SMTP or Resend; otherwise printed to the logs    |

## Quick start

```bash
git clone https://github.com/sardorml/captureflow.git
cd captureflow
cp .env.example .env    # set APP_URL
docker compose up -d
```

Open `APP_URL`. A fresh install opens a short setup: it creates the
administrator account, names your first workspace and invites its first
members, so do this before you share the address. `/` goes straight to sign-in
afterwards: self-hosted instances have no landing page, billing or storage caps, and idle
recordings are never deleted.

The images are built from this repo. `docker compose up -d --build` builds them
locally instead of pulling them.

## HTTPS

Browsers only allow screen and camera capture on a secure origin. Use one of
these:

- `http://localhost:3000` on the machine running Docker, or
- a reverse proxy with TLS in front, such as Caddy, Traefik, nginx or a
  Cloudflare Tunnel, with `APP_URL=https://rec.example.com`.

A plain `http://192.168.x.x` address loads the dashboard, but recording won't
start.

A minimal Caddyfile:

```
rec.example.com {
  reverse_proxy localhost:3000
}
```

Uploads stream through the app in chunks of a few MB, so the proxy doesn't need
a large body limit.

## Administrators, users and workspaces

There are two levels of access:

- **Administrator** is for the whole instance. The account created during setup
  is the first one. Administrators get an **Admin** link in the sidebar, which
  opens the admin area at `<APP_URL>/admin`.
- **Owner**, **member** and **viewer** are roles inside one workspace. The owner
  manages its members, members record into it, and viewers watch and comment.

In the admin area an administrator can:

- add a user, which creates the account and emails them a link to set their
  own password. They can be made an administrator and put into workspaces in
  the same step, and they open on the first of those workspaces
- send a new password link to someone who forgot theirs
- suspend an account, which signs it out everywhere and blocks sign-in until
  it is restored, or delete it
- make another user an administrator, or sign someone out everywhere
- create a workspace for each team, pick its owner and its first members,
  change the owner later, or delete a workspace with everything in it. Users
  picked as members join straight away
- invite members to any workspace, change their role, or remove them
- see and delete any recording, whoever made it
- watch disk space, see who holds the most, and clear uploads that never
  finished
- choose who can sign up

A workspace owner can invite anyone who already has an account. Only an
administrator can invite an address that has no account yet, because that invite
lets its holder create one. Sign-up is otherwise closed unless you list your
company's email domains under Admin → Settings; then anyone with an address on
them can create an account on their own. Nobody confirms these addresses by
email, so list only domains you trust.

Invites and password links go out by email once [email](#email) is set up.
Until then the admin area says no email was sent and shows each link, so you can
copy and send it yourself.

Everyone also has a personal workspace of their own, created with their account.

## Search engines

A self-hosted instance stays out of search results. Every response carries
`X-Robots-Tag: noindex, nofollow`, including share pages, videos and
screenshots, so a link you post publicly still opens for anyone who has it but
is never listed. If a proxy in front strips response headers, keep that one.

## Email

Workspace invites, password links and access requests go out by email. Pick one:

- `SMTP_URL=smtps://user:pass@smtp.example.com:465` and
  `MAIL_FROM=CaptureFlow <rec@example.com>`
- `RESEND_API_KEY=…`
- Neither: each message is printed to `docker compose logs web` with its link,
  which is fine for a personal instance.

## Transcripts

Set `WHISPER_API_URL` to any server that implements OpenAI's
`/v1/audio/transcriptions`. To run one next to CaptureFlow on the CPU:

```bash
# .env
WHISPER_API_URL=http://whisper:8000
WHISPER_MODEL=Systran/faster-whisper-small

docker compose --profile whisper up -d
```

The `whisper-model` service downloads the model once. You can also use a hosted
API, for example `WHISPER_API_URL=https://api.openai.com`,
`WHISPER_API_KEY=sk-…`, `WHISPER_MODEL=whisper-1`. Without `WHISPER_API_URL`,
a transcript request fails straight away with a message saying how to turn
transcripts on.

## Recorders

The store builds of the Chrome extension and the desktop app talk to
captureflow.dev. Build copies that point at your `APP_URL`:

- [Chrome extension](/self-hosting/extension): build with
  `WXT_WEB_BASE=<APP_URL>`, then put the extension id in
  `CAPTUREFLOW_EXTENSION_ID` in `.env` and run `docker compose up -d` again.
- [Desktop app](/self-hosting/desktop)

To point the dashboard's "Add to Chrome" button at your own listing, build the
image with
`docker compose build --build-arg NEXT_PUBLIC_CHROME_WEBSTORE_URL=<listing url>`.

## Backups and upgrades

Everything lives in `data/`. For a consistent copy while the app is running,
take a SQLite backup from inside the container, then copy the folder:

```bash
docker compose exec web node -e "new (require('node:sqlite').DatabaseSync)('/data/captureflow.sqlite').exec(\"VACUUM INTO '/data/backup.sqlite'\")"
```

Don't open `captureflow.sqlite` from the host while the containers are running.
On Docker Desktop (macOS and Windows), a write made from outside the containers
can leave the app reading stale data until it restarts. Use
`docker compose exec` instead.

To upgrade, run `docker compose pull && docker compose up -d`. Database
migrations apply automatically when the web container starts.

## Configuration

| Variable                           | Default                 | What it does                                                 |
| ---------------------------------- | ----------------------- | ------------------------------------------------------------ |
| `APP_URL`                          | `http://localhost:3000` | Public URL of the web app; share links and media use it      |
| `WEB_PORT`                         | `3000`                  | Host port in `docker-compose.yml`                            |
| `SMTP_URL`, `MAIL_FROM`            | unset                   | Outgoing mail over SMTP                                      |
| `RESEND_API_KEY`                   | unset                   | Outgoing mail through Resend instead                         |
| `WHISPER_API_URL`                  | unset                   | OpenAI-compatible transcription server; turns transcripts on |
| `WHISPER_API_KEY`, `WHISPER_MODEL` | unset, `whisper-1`      | Credentials and model for it                                 |
| `ALLOWED_EMAIL_DOMAINS`            | unset                   | Only verified addresses on these domains can sign up         |
| `GOOGLE_CLIENT_ID/SECRET`          | unset                   | Google sign-in                                               |
| `GITHUB_CLIENT_ID/SECRET`          | unset                   | GitHub sign-in                                               |
| `CAPTUREFLOW_EXTENSION_ID`         | unset                   | Your extension build's id, so it can sign in                 |
| `BETTER_AUTH_SECRET`               | generated               | Session signing; kept in `data/secrets.json`                 |
| `DATA_DIR`                         | `/data`                 | Where the containers keep their state                        |

Self-hosted instances don't send analytics: the images are built with analytics
off.
