-- Recording infrastructure schema for Cloudflare D1 (SQLite).
--
-- All timestamps are unix epoch milliseconds stored as INTEGER (SQLite's
-- INTEGER is 64-bit, so this fits comfortably until well after the year
-- 2200). State is TEXT for readability in the dashboard.
--
-- STRICT enforces declared column types — without it SQLite would accept
-- e.g. a string in size_bytes. STRICT requires all types to be one of
-- INT, INTEGER, REAL, TEXT, BLOB, ANY.

CREATE TABLE IF NOT EXISTS recordings (
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
  -- Total page-load count. Bumped from the [slug] page render
  -- (server side, fire-and-forget alongside last_viewed_at).
  -- Total counts (not unique) — keep MVP simple; uniqueness adds
  -- IP/cookie tracking + server-side dedupe state.
  view_count        INTEGER NOT NULL DEFAULT 0,
  -- Header line above the player (e.g. "Brave Browser —
  -- Tab title"). Comes from the recording's selected source name; we
  -- store it verbatim and let the page layer format the date.
  title             TEXT,
  state             TEXT NOT NULL,
  -- Owning better-auth user (nullable for legacy / anonymous recordings).
  -- Joins to users.id; populated from a Bearer token on /api/init.
  user_id           TEXT,
  -- 'public' resolves at /[slug] for anyone; 'private' resolves only
  -- when the viewer's app.captureflow.xyz session matches user_id.
  visibility        TEXT NOT NULL DEFAULT 'public',
  -- Post-finalize composite (cam + cursor + wallpaper bg) is uploaded
  -- via a follow-up /api/replace. 'expected' tells the recording page to
  -- overlay an "applying…" banner so the viewer doesn't think the
  -- bare-screen render is the final result. /api/replace flips this
  -- to 'done'. Legacy rows + uploads with nothing to bake stay 'none'.
  bake_status       TEXT NOT NULL DEFAULT 'none',
  -- Companion webcam stream uploaded in parallel with the screen MP4.
  -- The desktop streams webcam.webm (video + mic audio) to /api/webcam-part
  -- alongside the screen file. The web edit page composites the two
  -- at play time so cam PiP placement stays editable without re-encoding.
  -- `webcam_state='none'` means the recording had no camera attached.
  webcam_storage_key TEXT,
  webcam_upload_id   TEXT,
  webcam_size_bytes  INTEGER NOT NULL DEFAULT 0,
  webcam_state       TEXT NOT NULL DEFAULT 'none',
  CHECK (state IN ('pending', 'ready', 'failed')),
  CHECK (source IN ('instant', 'edited')),
  CHECK (preset IN ('recording')),
  CHECK (visibility IN ('public', 'private')),
  CHECK (bake_status IN ('none', 'expected', 'done')),
  CHECK (webcam_state IN ('none', 'pending', 'ready', 'failed'))
) STRICT;

CREATE INDEX IF NOT EXISTS idx_recordings_device
  ON recordings (device_id, created_at DESC);

-- Drives the user dashboard's "my recordings" query.
CREATE INDEX IF NOT EXISTS idx_recordings_user
  ON recordings (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- Partial index drives the daily retention sweep — only ready recordings
-- need GC, and we look up by last_viewed_at.
CREATE INDEX IF NOT EXISTS idx_recordings_gc
  ON recordings (last_viewed_at)
  WHERE state = 'ready';

-- Partial index drives the hourly multipart-abort GC — only pending
-- recordings need to be aborted, and we look up by created_at.
CREATE INDEX IF NOT EXISTS idx_recordings_pending_gc
  ON recordings (created_at)
  WHERE state = 'pending';

-- Anonymous emoji reactions, dropped at a specific video timestamp.
-- Per-row insert (no aggregation at write time) keeps the API a
-- single small POST; the recording page groups adjacent timestamps into
-- clusters at render time.
CREATE TABLE IF NOT EXISTS recording_reactions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT NOT NULL,
  emoji         TEXT NOT NULL,
  timestamp_ms  INTEGER NOT NULL,
  created_at    INTEGER NOT NULL
) STRICT;

CREATE INDEX IF NOT EXISTS idx_reactions_slug
  ON recording_reactions (slug, timestamp_ms);

-- Per-user quota overrides. A row exists only when the admin has
-- bumped (or pinned) a user's limits — absent row means inherit the
-- ACCOUNT_LIMITS defaults from the @captureflow/quota package. Either
-- override column may be NULL independently, so an admin can lift
-- the storage cap without touching the artifact-count cap (or vice
-- versa). The column is named `active_recordings_override` for back-
-- compat with the pre-screenshots schema; its semantic now covers the
-- combined recordings + screenshots artifact count.
CREATE TABLE IF NOT EXISTS user_quotas (
  user_id                TEXT PRIMARY KEY,
  storage_bytes_override INTEGER,
  active_recordings_override INTEGER,
  note                   TEXT,
  updated_at             INTEGER NOT NULL
) STRICT;

-- Screenshots. Sibling to `recordings`; both tables aggregate
-- into the same account-scoped storage cap via @captureflow/quota's
-- totalStorageForUser / activeArtifactCountForUser.
-- Written by the screenshot upload handler.
CREATE TABLE IF NOT EXISTS screenshots (
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

CREATE INDEX IF NOT EXISTS idx_screenshots_user
  ON screenshots (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_screenshots_active
  ON screenshots (user_id, state);

CREATE INDEX IF NOT EXISTS idx_screenshots_gc
  ON screenshots (last_viewed_at)
  WHERE state = 'ready';
