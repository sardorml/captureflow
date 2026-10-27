-- Each seat count pushed to billing, so the billing page can estimate the
-- prorated part of the next invoice.
CREATE TABLE seat_change (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  ls_subscription_id TEXT NOT NULL,
  from_quantity      INTEGER NOT NULL,
  to_quantity        INTEGER NOT NULL,
  changed_at         INTEGER NOT NULL
) STRICT;
CREATE INDEX idx_seat_change_subscription
  ON seat_change (ls_subscription_id, changed_at);
