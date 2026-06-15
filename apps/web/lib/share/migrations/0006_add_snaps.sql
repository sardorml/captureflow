-- Adds the `snaps` table. This file documents the migration alongside
-- the db code so the snaps table's shape is self-contained and
-- discoverable.

CREATE TABLE IF NOT EXISTS snaps (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL,
  device_id       TEXT,
  storage_key     TEXT NOT NULL,
  size_bytes      INTEGER NOT NULL,
  width           INTEGER NOT NULL,
  height          INTEGER NOT NULL,
  title           TEXT,
  state           TEXT NOT NULL DEFAULT 'ready',
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL,
  edited_at       INTEGER,
  last_viewed_at  INTEGER,
  view_count      INTEGER NOT NULL DEFAULT 0,
  CHECK (state IN ('ready', 'deleted'))
) STRICT;

CREATE INDEX IF NOT EXISTS idx_snaps_user
  ON snaps (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_snaps_active
  ON snaps (user_id, state);

CREATE INDEX IF NOT EXISTS idx_snaps_gc
  ON snaps (last_viewed_at)
  WHERE state = 'ready';
