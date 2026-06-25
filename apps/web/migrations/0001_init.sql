PRAGMA defer_foreign_keys=TRUE;
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
  state             TEXT NOT NULL, view_count INTEGER NOT NULL DEFAULT 0, title TEXT, user_id TEXT, visibility TEXT NOT NULL DEFAULT 'public', bake_status TEXT NOT NULL DEFAULT 'none'
  CHECK (bake_status IN ('none', 'expected', 'done')), webcam_storage_key TEXT, webcam_upload_id   TEXT, webcam_size_bytes  INTEGER NOT NULL DEFAULT 0, webcam_state       TEXT NOT NULL DEFAULT 'none'
  CHECK (webcam_state IN ('none', 'pending', 'ready', 'failed')), workspace_id TEXT REFERENCES workspace(id),
  CHECK (state IN ('pending', 'ready', 'failed')),
  CHECK (source IN ('instant', 'edited')),
  CHECK (preset IN ('recording'))
) STRICT;
CREATE TABLE IF NOT EXISTS recording_reactions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT NOT NULL,
  emoji         TEXT NOT NULL,
  timestamp_ms  INTEGER NOT NULL,
  created_at    INTEGER NOT NULL
, user_id   TEXT, user_name TEXT) STRICT;
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  expiresAt INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  userId TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  userId TEXT NOT NULL,
  accessToken TEXT,
  refreshToken TEXT,
  idToken TEXT,
  accessTokenExpiresAt INTEGER,
  refreshTokenExpiresAt INTEGER,
  scope TEXT,
  password TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS verifications (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt INTEGER NOT NULL,
  createdAt INTEGER,
  updatedAt INTEGER
);
CREATE TABLE IF NOT EXISTS device_tokens (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  token_hash    TEXT NOT NULL UNIQUE,
  label         TEXT,
  created_at    INTEGER NOT NULL,
  last_used_at  INTEGER,
  revoked_at    INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS user_quotas (
  user_id                TEXT PRIMARY KEY,
  
  
  
  storage_bytes_override INTEGER,
  active_recordings_override INTEGER,
  
  
  
  note                   TEXT,
  updated_at             INTEGER NOT NULL
) STRICT;
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
  view_count      INTEGER NOT NULL DEFAULT 0, workspace_id TEXT REFERENCES workspace(id), visibility TEXT NOT NULL DEFAULT 'public',
  CHECK (state IN ('ready', 'deleted'))
) STRICT;
CREATE TABLE IF NOT EXISTS pro_subscription (
  
  
  
  ls_subscription_id     TEXT PRIMARY KEY,
  
  
  
  
  
  user_id                TEXT,
  
  
  ls_variant_id          TEXT NOT NULL,
  ls_customer_id         TEXT,
  ls_customer_email      TEXT NOT NULL,
  
  
  
  status                 TEXT NOT NULL,
  
  
  cycle                  TEXT NOT NULL,
  
  
  
  
  current_period_end     INTEGER,
  
  
  cancelled_at           INTEGER,
  created_at             INTEGER NOT NULL,
  updated_at             INTEGER NOT NULL
) STRICT;
CREATE TABLE IF NOT EXISTS workspace (
  
  
  
  id              TEXT PRIMARY KEY,
  
  
  
  
  slug            TEXT NOT NULL UNIQUE,
  
  
  
  
  
  kind            TEXT NOT NULL DEFAULT 'personal',
  
  
  name            TEXT NOT NULL,
  
  
  owner_user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
, logo_key             TEXT, allow_public_links   INTEGER NOT NULL DEFAULT 1, allow_member_uploads INTEGER NOT NULL DEFAULT 1) STRICT;
CREATE TABLE IF NOT EXISTS workspace_member (
  workspace_id    TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  
  
  role            TEXT NOT NULL DEFAULT 'member',
  joined_at       INTEGER NOT NULL,
  PRIMARY KEY (workspace_id, user_id)
) STRICT;
CREATE TABLE IF NOT EXISTS workspace_invite (
  id                   TEXT PRIMARY KEY,
  workspace_id         TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  
  
  email                TEXT NOT NULL,
  
  
  
  token_hash           TEXT NOT NULL UNIQUE,
  invited_by_user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at           INTEGER NOT NULL,
  expires_at           INTEGER NOT NULL,
  
  accepted_at          INTEGER
) STRICT;
CREATE TABLE IF NOT EXISTS recording_comments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL,
  user_id     TEXT NOT NULL,
  user_name   TEXT NOT NULL,
  body        TEXT NOT NULL,
  created_at  INTEGER NOT NULL
, timestamp_ms INTEGER) STRICT;
CREATE TABLE IF NOT EXISTS recording_activity (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT NOT NULL,
  kind          TEXT NOT NULL CHECK (kind IN ('reaction', 'comment')),
  
  
  user_id       TEXT,
  user_name     TEXT,
  
  emoji         TEXT,
  
  body          TEXT,
  
  
  
  
  timestamp_ms  INTEGER,
  created_at    INTEGER NOT NULL
) STRICT;
DELETE FROM sqlite_sequence;
CREATE INDEX IF NOT EXISTS idx_recordings_device
  ON recordings (device_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recordings_gc
  ON recordings (last_viewed_at)
  WHERE state = 'ready';
CREATE INDEX IF NOT EXISTS idx_recordings_pending_gc
  ON recordings (created_at)
  WHERE state = 'pending';
CREATE INDEX IF NOT EXISTS idx_reactions_slug
  ON recording_reactions (slug, timestamp_ms);
CREATE INDEX IF NOT EXISTS sessions_userId_idx ON sessions(userId);
CREATE INDEX IF NOT EXISTS accounts_userId_idx ON accounts(userId);
CREATE INDEX IF NOT EXISTS verifications_identifier_idx ON verifications(identifier);
CREATE INDEX IF NOT EXISTS idx_recordings_user
  ON recordings (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_device_tokens_user
  ON device_tokens (user_id, last_used_at DESC);
CREATE INDEX IF NOT EXISTS idx_screenshots_user
  ON screenshots (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_screenshots_active
  ON screenshots (user_id, state);
CREATE INDEX IF NOT EXISTS idx_screenshots_gc
  ON screenshots (last_viewed_at)
  WHERE state = 'ready';
CREATE INDEX IF NOT EXISTS idx_pro_subscription_email
  ON pro_subscription(ls_customer_email);
CREATE INDEX IF NOT EXISTS idx_pro_subscription_user_id
  ON pro_subscription(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workspace_owner
  ON workspace(owner_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_workspace_owner_personal
  ON workspace(owner_user_id) WHERE kind = 'personal';
CREATE INDEX IF NOT EXISTS idx_workspace_member_user
  ON workspace_member(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invite_workspace
  ON workspace_invite(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invite_email
  ON workspace_invite(LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS idx_workspace_invite_pending_unique
  ON workspace_invite(workspace_id, LOWER(email))
  WHERE accepted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_recordings_workspace
  ON recordings(workspace_id, created_at DESC)
  WHERE workspace_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_screenshots_workspace
  ON screenshots(workspace_id, created_at DESC)
  WHERE workspace_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recording_comments_slug
  ON recording_comments (slug, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_slug_created
  ON recording_activity (slug, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_slug_ts
  ON recording_activity (slug, timestamp_ms);
CREATE INDEX IF NOT EXISTS idx_activity_slug_kind
  ON recording_activity (slug, kind);
