-- Who viewed a recording, one row per viewer: a signed-in user by id, anyone
-- else by a hash of address and browser (lib/recording/viewer-key.ts).
-- `recordings.view_count` stays the page-load total the cards show.
CREATE TABLE recording_views (
  slug            TEXT NOT NULL REFERENCES recordings(slug) ON DELETE CASCADE,
  viewer_key      TEXT NOT NULL,
  user_id         TEXT,
  first_viewed_at INTEGER NOT NULL,
  last_viewed_at  INTEGER NOT NULL,
  views           INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (slug, viewer_key)
) STRICT;

CREATE INDEX idx_recording_views_slug_last
  ON recording_views (slug, last_viewed_at DESC);
