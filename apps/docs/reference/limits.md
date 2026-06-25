# Storage & limits

CaptureFlow enforces **per-user storage quotas** (and workspace math) via the
`@captureflow/quota` package. What the limits actually are is up to whoever runs
the instance — they're configured server-side, not hard-coded into the client.

## What counts toward storage

Everything you upload lives in R2 and counts toward your quota:

- **Recordings** — the video files (`videos/`) and their poster images
  (`posters/`).
- **Screenshots** — screenshot PNGs (`screenshots/`).

The dashboard's **Storage usage** view shows how much of your quota you've used.

## Retention

A **daily retention sweep** (a Cloudflare Cron Trigger) removes content past the
instance's retention policy. An **hourly job** garbage-collects abandoned
multipart uploads — recordings that were started but never finalized — so failed
uploads don't silently consume space.

## Cloudflare free-tier ceilings

If you self-host, the underlying Cloudflare limits apply. These are **per
account**, not per domain:

| Resource             | Free tier                        |
| -------------------- | -------------------------------- |
| **R2** storage       | 10 GB, then usage-based          |
| **R2** operations    | Class A/B daily operation limits |
| **D1** storage       | 5 GB                             |
| **D1** rows          | Daily read/written row limits    |
| **Workers** requests | 100k/day                         |

For a video-heavy workload you'll usually hit **R2 storage and operation
limits** before anything else. Plan capacity around R2 first.

## Tuning quotas

Quota logic lives in `packages/quota` (`limits.ts`, `user-quotas.ts`,
`totals.ts`, `workspaces.ts`). Adjust limits there if you're running your own
instance and want different ceilings.
