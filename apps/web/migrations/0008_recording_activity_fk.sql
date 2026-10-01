-- recording_activity previously had no FK, so comment/reaction rows outlived
-- their recording unless every delete path remembered to clean them (two of
-- three forgot). SQLite can't ADD CONSTRAINT, hence the rebuild. The copy
-- filters any already-orphaned rows; ids are preserved so existing anchors
-- keep working. ON DELETE CASCADE is now the single cleanup mechanism —
-- delete paths no longer touch this table directly.
CREATE TABLE recording_activity_fk (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT NOT NULL REFERENCES recordings(slug) ON DELETE CASCADE,
  kind          TEXT NOT NULL CHECK (kind IN ('reaction', 'comment')),
  user_id       TEXT,
  user_name     TEXT,
  emoji         TEXT,
  body          TEXT,
  timestamp_ms  INTEGER,
  created_at    INTEGER NOT NULL
) STRICT;

INSERT INTO recording_activity_fk
  (id, slug, kind, user_id, user_name, emoji, body, timestamp_ms, created_at)
  SELECT id, slug, kind, user_id, user_name, emoji, body, timestamp_ms, created_at
    FROM recording_activity
   WHERE slug IN (SELECT slug FROM recordings);

DROP TABLE recording_activity;
ALTER TABLE recording_activity_fk RENAME TO recording_activity;

CREATE INDEX idx_activity_slug_created
  ON recording_activity (slug, created_at DESC);
CREATE INDEX idx_activity_slug_ts
  ON recording_activity (slug, timestamp_ms);
CREATE INDEX idx_activity_slug_kind
  ON recording_activity (slug, kind);
