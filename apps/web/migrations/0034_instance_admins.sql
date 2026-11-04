-- Self-hosted instances are run from the admin app: these say who runs it,
-- which email domains may sign up on their own (empty: invite-only) and whether
-- its first-run setup finished. Unused on the hosted service.
CREATE TABLE IF NOT EXISTS instance_admin (
  user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  granted_at INTEGER NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS instance_settings (
  id              INTEGER PRIMARY KEY CHECK (id = 1),
  signup_domains  TEXT NOT NULL DEFAULT '',
  setup_completed INTEGER NOT NULL DEFAULT 0
) STRICT;
