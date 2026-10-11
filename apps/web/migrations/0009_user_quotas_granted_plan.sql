-- An operator can grant a paid plan from the admin panel without a Lemon
-- Squeezy subscription (support comps, partners, refunds-in-kind). The variant
-- id is one of STORAGE_PLANS; a NULL expiry means the grant has no end date.
-- Timestamps here are epoch milliseconds, like the rest of user_quotas.
ALTER TABLE user_quotas ADD COLUMN granted_plan_variant_id TEXT;
ALTER TABLE user_quotas ADD COLUMN granted_plan_expires_at INTEGER;
