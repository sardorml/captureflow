-- Seat plans replaced per-user storage plans, grants and overrides; nothing
-- reads these tables any more.
DROP TABLE IF EXISTS pro_subscription;
DROP TABLE IF EXISTS user_quotas;
