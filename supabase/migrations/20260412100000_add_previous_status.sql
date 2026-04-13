-- Store the status a customer had before being marked not_interested,
-- so the merchant can revert them to exactly where they were.

ALTER TABLE referral_conversions
  ADD COLUMN IF NOT EXISTS previous_status TEXT DEFAULT NULL;

ALTER TABLE property_inquiries
  ADD COLUMN IF NOT EXISTS previous_status TEXT DEFAULT NULL;
