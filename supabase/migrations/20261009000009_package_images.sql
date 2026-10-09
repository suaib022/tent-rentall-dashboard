ALTER TABLE packages ADD COLUMN IF NOT EXISTS image_url text;

UPDATE packages SET image_url = 'https://framerusercontent.com/images/YrKU0tBtVWbvMDZUwOzB89yn6fE.png?width=1448&height=1086' WHERE slug = 'the-gathering';
UPDATE packages SET image_url = 'https://framerusercontent.com/images/ssFE1sbzHPh22ipaZQPhqIEEas.png?width=1448&height=1086' WHERE slug = 'the-celebration';
UPDATE packages SET image_url = 'https://framerusercontent.com/images/SSZ4VI1oD1xG798NPBORD9vg.png?width=1448&height=1086' WHERE slug = 'the-grand-event';
UPDATE packages SET image_url = 'https://framerusercontent.com/images/RSDmwXIkO8F7iMYrJGiAKJQLg.png?width=1448&height=1086' WHERE slug = 'the-big-one';
