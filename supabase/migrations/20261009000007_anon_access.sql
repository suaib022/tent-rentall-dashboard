-- Temporarily allow anon access to catalog tables for development
CREATE POLICY "Anon can manage tent_styles" ON tent_styles FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can manage packages" ON packages FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can manage accessories" ON accessories FOR ALL TO anon USING (true) WITH CHECK (true);
