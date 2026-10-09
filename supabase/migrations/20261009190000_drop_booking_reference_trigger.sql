-- Drop the reference trigger for bookings since the column was removed
DROP TRIGGER IF EXISTS trigger_set_booking_reference ON bookings;
