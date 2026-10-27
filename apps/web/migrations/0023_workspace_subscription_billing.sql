-- The card on file and the subscription's own portal links, from each
-- webhook, so the billing page can show how the workspace pays.
ALTER TABLE workspace_subscription ADD COLUMN card_brand TEXT;
ALTER TABLE workspace_subscription ADD COLUMN card_last_four TEXT;
ALTER TABLE workspace_subscription ADD COLUMN portal_url TEXT;
ALTER TABLE workspace_subscription ADD COLUMN update_payment_url TEXT;
