-- Media URLs whose CDN purge failed when their recording was deleted; the
-- hourly cron retries them until Cloudflare confirms.
CREATE TABLE cdn_purge_queue (
  url        TEXT PRIMARY KEY,
  attempts   INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
) STRICT;
