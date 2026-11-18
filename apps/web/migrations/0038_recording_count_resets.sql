-- When staff last reset a person's free-plan recording count from the admin
-- dashboard. Only recordings made after it count toward the cap; nothing is
-- deleted.
CREATE TABLE IF NOT EXISTS user_recording_count_reset (
  user_id  TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  reset_at INTEGER NOT NULL,
  reset_by TEXT NOT NULL
) STRICT;
