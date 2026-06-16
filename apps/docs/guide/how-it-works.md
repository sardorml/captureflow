# How it works

CaptureFlow has two halves that talk to each other over HTTPS:

- The **desktop recorder** (`apps/desktop`) — an Electron app that captures your
  screen and webcam locally.
- The **web backend** (`apps/web`) — a Next.js app on Cloudflare Workers that
  stores recordings, serves share pages, and powers the dashboard.

## The recording → link pipeline

```
┌──────────────┐   streaming upload    ┌─────────────────────┐
│ Desktop app  │ ────────────────────► │  Cloudflare Worker  │
│ (record)     │   (chunks while you   │  (Next.js / OpenNext)│
└──────────────┘    are still recording)└──────────┬──────────┘
       │                                            │
       │ stop ─► link ready                         ▼
       ▼                                  ┌──────────────────┐
┌──────────────┐    share link    ┌──────►│  R2 (video/poster)│
│   Viewer     │ ◄────────────────│       │  D1 (metadata)    │
│  (browser)   │   plays from CDN │       └──────────────────┘
└──────────────┘                  └── share viewer page
```

1. **Capture** — the recorder uses native macOS helpers (screen, window
   detection, cursor tracking) to grab frames, compositing the webcam bubble and
   smoothed cursor on top.
2. **Stream while recording** — instead of waiting for you to finish, the app
   uploads the recording in parts (a multipart upload) as it's being made. By
   the time you stop, most of the bytes are already in storage.
3. **Finalize** — on stop, the upload is finalized, a poster image is generated,
   and a row is written to the database. You immediately get a share URL.
4. **Serve** — viewers open the share page; the video and poster are served from
   R2 over your CDN domain, and the metadata (title, visibility, reactions,
   comments) comes from the database.

## What stores what

| Concern | Where it lives |
| --- | --- |
| Video files, poster images, snap PNGs | **R2** (object storage), under `videos/`, `posters/`, `snaps/` |
| Recording & snap metadata, users, workspaces, reactions, comments, quotas | **D1** (SQLite at the edge) |
| Auth sessions | Signed by **Better Auth** (`BETTER_AUTH_SECRET`) |
| Static dashboard / share assets | Served by the Worker's `ASSETS` binding |

## Housekeeping

Two scheduled jobs keep storage tidy (Cloudflare Cron Triggers, wired in
`worker.ts`):

- **Hourly** — garbage-collect abandoned multipart uploads (recordings that were
  started but never finalized).
- **Daily** — a retention sweep that removes content past your retention policy.

Next: [Install the app](/guide/install).
