-- Accounts a self-hosted administrator has suspended: no new session starts
-- while the row exists. Unused on the hosted service.
CREATE TABLE IF NOT EXISTS instance_suspension (
  user_id      TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  suspended_at INTEGER NOT NULL
) STRICT;
