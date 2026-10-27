-- What changed for someone in a workspace: a join, a seat request, a role
-- change. Pending invites are read live from workspace_invite instead.
CREATE TABLE notification (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id  TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL,
  actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  role          TEXT,
  effective_at  INTEGER,
  created_at    INTEGER NOT NULL,
  read_at       INTEGER
) STRICT;

CREATE INDEX idx_notification_user
  ON notification (user_id, created_at DESC);
