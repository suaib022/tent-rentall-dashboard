-- Temporarily allow anon access to bookings for development
CREATE POLICY "Anon can manage bookings" ON bookings FOR ALL TO anon USING (true) WITH CHECK (true);
