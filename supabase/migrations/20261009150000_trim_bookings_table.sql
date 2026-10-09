-- Rename customer fields
ALTER TABLE bookings RENAME COLUMN customer_name TO name;
ALTER TABLE bookings RENAME COLUMN customer_email TO email;
ALTER TABLE bookings RENAME COLUMN customer_phone TO phone;

-- Add new columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS event_date date;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS venue_address text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS add_on_accessories_id uuid REFERENCES accessories(id) ON DELETE SET NULL;

-- Drop foreign keys for columns we are about to drop
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_tent_style_id_fkey;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_conversation_id_fkey;

-- Drop columns not in the user's list (but keeping id, status, created_at, updated_at)
ALTER TABLE bookings DROP COLUMN IF EXISTS reference;
ALTER TABLE bookings DROP COLUMN IF EXISTS source;
ALTER TABLE bookings DROP COLUMN IF EXISTS tent_style_id;
ALTER TABLE bookings DROP COLUMN IF EXISTS subtotal_cents;
ALTER TABLE bookings DROP COLUMN IF EXISTS delivery_fee_cents;
ALTER TABLE bookings DROP COLUMN IF EXISTS tax_cents;
ALTER TABLE bookings DROP COLUMN IF EXISTS total_cents;
ALTER TABLE bookings DROP COLUMN IF EXISTS deposit_cents;
ALTER TABLE bookings DROP COLUMN IF EXISTS hold_expires_at;
ALTER TABLE bookings DROP COLUMN IF EXISTS availability_flag;
ALTER TABLE bookings DROP COLUMN IF EXISTS notes;
ALTER TABLE bookings DROP COLUMN IF EXISTS conversation_id;
