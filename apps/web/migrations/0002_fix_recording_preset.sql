-- The recording-domain rename changed the `preset` value 'share' -> 'recording'.
-- Earlier migrations were edited in place, so any database that had already
-- applied them keeps the old CHECK (preset IN ('share')) and rejects inserts of
-- 'recording' — breaking /api/r/init. SQLite cannot alter a CHECK in place, so
-- rebuild the table with the corrected constraint and migrate existing rows.

CREATE TABLE recordings_new (
  slug              TEXT PRIMARY KEY,
  device_id         TEXT NOT NULL,
  storage_key       TEXT NOT NULL,
  poster_key        TEXT,
  upload_id         TEXT,
  size_bytes        INTEGER NOT NULL DEFAULT 0,
  duration_ms       INTEGER,
  width             INTEGER,
  height            INTEGER,
  source            TEXT NOT NULL,
  preset            TEXT NOT NULL,
  created_at        INTEGER NOT NULL,
  last_viewed_at    INTEGER NOT NULL,
  state             TEXT NOT NULL,
  view_count        INTEGER NOT NULL DEFAULT 0,
  title             TEXT,
  user_id           TEXT,
  visibility        TEXT NOT NULL DEFAULT 'public',
  bake_status       TEXT NOT NULL DEFAULT 'none',
  webcam_storage_key TEXT,
  webcam_upload_id   TEXT,
  webcam_size_bytes  INTEGER NOT NULL DEFAULT 0,
  webcam_state       TEXT NOT NULL DEFAULT 'none',
  workspace_id      TEXT REFERENCES workspace(id),
  CHECK (state IN ('pending', 'ready', 'failed')),
  CHECK (source IN ('instant', 'edited')),
  CHECK (preset IN ('recording')),
  CHECK (bake_status IN ('none', 'expected', 'done')),
  CHECK (webcam_state IN ('none', 'pending', 'ready', 'failed'))
) STRICT;

INSERT INTO recordings_new (
  slug, device_id, storage_key, poster_key, upload_id,
  size_bytes, duration_ms, width, height, source, preset,
  created_at, last_viewed_at, state, view_count, title, user_id,
  visibility, bake_status, webcam_storage_key, webcam_upload_id,
  webcam_size_bytes, webcam_state, workspace_id
)
SELECT
  slug, device_id, storage_key, poster_key, upload_id,
  size_bytes, duration_ms, width, height, source,
  CASE WHEN preset = 'share' THEN 'recording' ELSE preset END,
  created_at, last_viewed_at, state, view_count, title, user_id,
  visibility, bake_status, webcam_storage_key, webcam_upload_id,
  webcam_size_bytes, webcam_state, workspace_id
FROM recordings;

DROP TABLE recordings;
ALTER TABLE recordings_new RENAME TO recordings;

CREATE INDEX IF NOT EXISTS idx_recordings_device
  ON recordings (device_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recordings_gc
  ON recordings (last_viewed_at) WHERE state = 'ready';
CREATE INDEX IF NOT EXISTS idx_recordings_pending_gc
  ON recordings (created_at) WHERE state = 'pending';
CREATE INDEX IF NOT EXISTS idx_recordings_user
  ON recordings (user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recordings_workspace
  ON recordings (workspace_id, created_at DESC) WHERE workspace_id IS NOT NULL;
