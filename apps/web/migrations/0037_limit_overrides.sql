-- Free-tier recording limits that staff raised from the admin dashboard, for
-- one person or for everyone in a workspace. A NULL column keeps the default.
-- Paid and self-hosted workspaces have no caps and ignore both tables.
CREATE TABLE IF NOT EXISTS user_limit_override (
  user_id          TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  recordings       INTEGER,
  max_recording_ms INTEGER,
  updated_at       INTEGER NOT NULL,
  updated_by       TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS workspace_limit_override (
  workspace_id     TEXT PRIMARY KEY REFERENCES workspace(id) ON DELETE CASCADE,
  recordings       INTEGER,
  max_recording_ms INTEGER,
  updated_at       INTEGER NOT NULL,
  updated_by       TEXT NOT NULL
) STRICT;
