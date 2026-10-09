-- Add random quantities to existing inventory
UPDATE tent_styles SET quantity = floor(random() * 10 + 2)::int WHERE quantity = 0 OR quantity IS NULL;
UPDATE packages SET quantity = floor(random() * 8 + 1)::int WHERE quantity = 0 OR quantity IS NULL;
UPDATE accessories SET quantity = floor(random() * 20 + 5)::int WHERE quantity = 0 OR quantity IS NULL;

-- Just to be sure, update all if they were set to a default of 1 previously
UPDATE tent_styles SET quantity = floor(random() * 10 + 2)::int;
UPDATE packages SET quantity = floor(random() * 8 + 1)::int;
UPDATE accessories SET quantity = floor(random() * 20 + 5)::int;
