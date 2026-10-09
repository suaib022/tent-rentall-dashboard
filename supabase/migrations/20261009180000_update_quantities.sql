-- Update quantities to be between 3 and 7
UPDATE tent_styles SET quantity = floor(random() * 5 + 3)::int;
UPDATE packages SET quantity = floor(random() * 5 + 3)::int;
UPDATE accessories SET quantity = floor(random() * 5 + 3)::int;
