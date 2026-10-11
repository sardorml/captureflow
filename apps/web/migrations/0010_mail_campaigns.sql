-- Product email to users, written in the admin panel and sent by the mailer
-- Worker (apps/mailer). An 'all' campaign goes to `users` minus
-- mail_unsubscribes, read at send time, so later signups are included; a
-- 'selected' one goes to the addresses in mail_campaign_recipients, minus the
-- same unsubscribes.

CREATE TABLE IF NOT EXISTS mail_campaigns (
  id            TEXT PRIMARY KEY,
  subject       TEXT NOT NULL,
  body          TEXT NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('draft', 'sending', 'sent')),
  audience      TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'selected')),
  created_by    TEXT NOT NULL,
  created_at    INTEGER NOT NULL,
  started_at    INTEGER,
  finished_at   INTEGER,
  sent_count    INTEGER NOT NULL DEFAULT 0,
  failed_count  INTEGER NOT NULL DEFAULT 0
) STRICT;

CREATE INDEX IF NOT EXISTS idx_mail_campaigns_created
  ON mail_campaigns (created_at DESC);

CREATE TABLE IF NOT EXISTS mail_campaign_recipients (
  campaign_id  TEXT NOT NULL REFERENCES mail_campaigns (id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  PRIMARY KEY (campaign_id, email)
) STRICT;

-- One row per address a campaign reached. A retried page skips these, so a
-- failure halfway through never sends anyone the same email twice.
CREATE TABLE IF NOT EXISTS mail_deliveries (
  campaign_id  TEXT NOT NULL REFERENCES mail_campaigns (id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  created_at   INTEGER NOT NULL,
  PRIMARY KEY (campaign_id, email)
) STRICT;

-- Keyed by lowercased address, not user id, so an opt-out outlives the account
-- and still holds if the same address signs up again.
CREATE TABLE IF NOT EXISTS mail_unsubscribes (
  email       TEXT PRIMARY KEY,
  created_at  INTEGER NOT NULL
) STRICT;
