-- Self-hosted instances are run from the web app: these say who runs it and
-- whether anyone can sign up. Unused on the hosted service.
CREATE TABLE IF NOT EXISTS instance_admin (
  user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  granted_at INTEGER NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS instance_settings (
  id          INTEGER PRIMARY KEY CHECK (id = 1),
  open_signup INTEGER NOT NULL DEFAULT 0
) STRICT;
