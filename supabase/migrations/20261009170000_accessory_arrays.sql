ALTER TABLE bookings DROP COLUMN IF EXISTS add_on_accessories_id;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS addon_accessories_ids uuid[];
