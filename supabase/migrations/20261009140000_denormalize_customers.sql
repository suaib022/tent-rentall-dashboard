-- Drop constraints
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_customer_id_fkey;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_quote_request_id_fkey;
ALTER TABLE quote_requests DROP CONSTRAINT IF EXISTS quote_requests_customer_id_fkey;
ALTER TABLE change_requests DROP CONSTRAINT IF EXISTS change_requests_customer_id_fkey;
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_customer_id_fkey;

-- Add customer fields directly
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_phone text;

ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS customer_phone text;

-- Migrate data if any exists (Optional, but safe)
UPDATE bookings b SET 
  customer_name = (SELECT first_name || ' ' || last_name FROM customers c WHERE c.id = b.customer_id),
  customer_email = (SELECT email FROM customers c WHERE c.id = b.customer_id),
  customer_phone = (SELECT phone FROM customers c WHERE c.id = b.customer_id)
WHERE customer_id IS NOT NULL;

-- Drop customer_id columns
ALTER TABLE bookings DROP COLUMN IF EXISTS customer_id;
ALTER TABLE bookings DROP COLUMN IF EXISTS quote_request_id;
ALTER TABLE quote_requests DROP COLUMN IF EXISTS customer_id;
ALTER TABLE change_requests DROP COLUMN IF EXISTS customer_id;
ALTER TABLE conversations DROP COLUMN IF EXISTS customer_id;
