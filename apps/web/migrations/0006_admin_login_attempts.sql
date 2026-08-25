-- Brute-force throttle for the admin panel. The panel answers on the public
-- internet and each sign-in costs 100k PBKDF2 iterations of metered Worker CPU,
-- so unlimited attempts are both a guessing problem and a billing one.
--
-- One row per scope key ("ip:<addr>", "email:<addr>"), so a distributed attack
-- on one account and a single host spraying many accounts both hit a ceiling.
-- D1 rather than KV because the panel already has this binding and a throttle
-- that is eventually consistent is not a throttle.
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id TEXT PRIMARY KEY,
  failures INTEGER NOT NULL DEFAULT 0,
  first_failure_at INTEGER NOT NULL,
  locked_until INTEGER NOT NULL DEFAULT 0
);

-- Supports the sweep of expired rows; the lookup itself is by primary key.
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_locked
  ON admin_login_attempts (locked_until);
