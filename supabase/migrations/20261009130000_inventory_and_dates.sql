-- Add quantity to catalog tables
ALTER TABLE tent_styles ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1;
ALTER TABLE accessories ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1;

-- Add start_date and end_date to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS end_date date;
