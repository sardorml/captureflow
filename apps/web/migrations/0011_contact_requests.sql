-- Messages from the public forms (suggest-a-feature, the self-host setup
-- request and the enterprise contact form), listed in the admin inbox.
-- details holds each form's extra pick fields as JSON. ip_hash is an HMAC of
-- the sender's IP, kept only to rate-limit the forms; the raw address is
-- never stored.

CREATE TABLE IF NOT EXISTS contact_requests (
  id          TEXT PRIMARY KEY,
  kind        TEXT NOT NULL
              CHECK (kind IN ('suggestion', 'setup', 'enterprise')),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  subject     TEXT NOT NULL,
  body        TEXT NOT NULL,
  details     TEXT NOT NULL DEFAULT '{}',
  user_id     TEXT,
  ip_hash     TEXT NOT NULL,
  created_at  INTEGER NOT NULL
) STRICT;

CREATE INDEX IF NOT EXISTS idx_contact_requests_kind_created
  ON contact_requests (kind, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_requests_ip
  ON contact_requests (ip_hash, created_at);
