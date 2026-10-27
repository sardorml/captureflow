-- A viewer asks the owner for a paid seat; one open request per person.
CREATE TABLE seat_request (
  workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   INTEGER NOT NULL,
  PRIMARY KEY (workspace_id, user_id)
) STRICT;

-- A member moved to viewer in a paid workspace keeps the paid seat until the
-- billing period ends; the daily cron applies it then.
ALTER TABLE workspace_member ADD COLUMN downgrade_at INTEGER;
