# Run with Docker

The Docker images run CaptureFlow on any machine with Docker: a home server, a
NAS or a VPS. You don't need a Cloudflare account. Everything is stored in one
`data/` folder: a SQLite database, the recordings, and the secrets generated on
first start.

| Piece                | In Docker                                                  |
| -------------------- | ---------------------------------------------------------- |
| Web app (`apps/web`) | `ghcr.io/sardorml/captureflow`, port 3000                  |
| Admin panel          | `ghcr.io/sardorml/captureflow-admin`, port 3001            |
| Database             | SQLite, `data/captureflow.sqlite`                          |
| Recordings           | Files under `data/storage/`, served at `<APP_URL>/media/…` |
| Scheduled jobs       | Run inside the web container (same schedule as Cloudflare) |
| Transcripts          | Optional: any OpenAI-compatible Whisper server             |
| Email                | Optional: SMTP or Resend; otherwise printed to the logs    |

## Quick start

```bash
git clone https://github.com/sardorml/captureflow.git
cd captureflow
cp .env.example .env    # set APP_URL and ADMIN_URL
docker compose up -d
```

Open `APP_URL` and create the first account. `/` goes straight to sign-in:
self-hosted instances have no landing page, billing or storage caps, and idle
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
start. The admin panel's session cookie also needs HTTPS outside localhost.

A minimal Caddyfile:

```
rec.example.com {
  reverse_proxy localhost:3000
}
admin.rec.example.com {
  reverse_proxy localhost:3001
}
```

Uploads stream through the app in chunks of a few MB, so the proxy doesn't need
a large body limit.

## First admin

The admin panel at `ADMIN_URL` manages users, workspaces, plans and the audit
log. On first start it creates a one-time setup token:

```bash
docker compose exec admin cat /data/secrets.json   # ADMIN_SETUP_TOKEN
```

Open `ADMIN_URL`, paste the token and create the owner account.

Campaign emails need the separate mailer Worker, so sending is switched off in
Docker. You can still write drafts.

## Email

Workspace invites, access requests and welcome notes go out by email. Pick
one:

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
| `ADMIN_URL`                        | `http://localhost:3001` | Public URL of the admin panel                                |
| `WEB_PORT` / `ADMIN_PORT`          | `3000` / `3001`         | Host ports in `docker-compose.yml`                           |
| `SMTP_URL`, `MAIL_FROM`            | unset                   | Outgoing mail over SMTP                                      |
| `RESEND_API_KEY`                   | unset                   | Outgoing mail through Resend instead                         |
| `WHISPER_API_URL`                  | unset                   | OpenAI-compatible transcription server; turns transcripts on |
| `WHISPER_API_KEY`, `WHISPER_MODEL` | unset, `whisper-1`      | Credentials and model for it                                 |
| `ALLOWED_EMAIL_DOMAINS`            | unset                   | Only verified addresses on these domains can sign up         |
| `GOOGLE_CLIENT_ID/SECRET`          | unset                   | Google sign-in                                               |
| `GITHUB_CLIENT_ID/SECRET`          | unset                   | GitHub sign-in                                               |
| `CAPTUREFLOW_EXTENSION_ID`         | unset                   | Your extension build's id, so it can sign in                 |
| `BETTER_AUTH_SECRET`               | generated               | Session signing; kept in `data/secrets.json`                 |
| `ADMIN_SESSION_SECRET`             | generated               | Admin session signing                                        |
| `ADMIN_SETUP_TOKEN`                | generated               | One-time admin claim token                                   |
| `DATA_DIR`                         | `/data`                 | Where the containers keep their state                        |

Self-hosted instances don't send analytics: the images are built with analytics
off.
