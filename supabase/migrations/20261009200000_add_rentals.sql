-- Add tent rental support to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_type text DEFAULT 'event';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tent_id uuid REFERENCES tent_styles(id) ON DELETE SET NULL;
