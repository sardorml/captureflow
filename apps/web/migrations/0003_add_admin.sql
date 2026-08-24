-- Instance-admin service: its own accounts, invites, and audit trail.
--
-- These are deliberately separate from `users`: an admin is whoever operates the
-- Cloudflare deployment, not an account inside the product. The two never join,
-- and an admin row grants nothing in the product itself.
CREATE TABLE IF NOT EXISTS admin_users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    INTEGER NOT NULL,
  last_login_at INTEGER
);

-- Only the hash of the invite token is stored, so a database leak cannot be
-- replayed to claim a pending invite.
CREATE TABLE IF NOT EXISTS admin_invites (
  token_hash  TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL,
  invited_by  TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL,
  accepted_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_admin_invites_email ON admin_invites (email);

-- First-run claim tokens minted by the deployment itself, for operators who
-- have not set ADMIN_SETUP_TOKEN. Short-lived and single-use; only the hash is
-- stored, and the raw value is only ever written to the server log.
CREATE TABLE IF NOT EXISTS admin_setup_tokens (
  token_hash TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_audit (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  actor       TEXT NOT NULL,
  action      TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id   TEXT NOT NULL,
  detail      TEXT,
  created_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_target ON admin_audit (target_type, target_id);
