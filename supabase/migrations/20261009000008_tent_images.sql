ALTER TABLE tent_styles ADD COLUMN IF NOT EXISTS image_url text;

UPDATE tent_styles SET image_url = 'https://framerusercontent.com/images/gMuQJuKKrmVLwQcO53OMo4YP34s.png?scale-down-to=1024&width=1448&height=1086' WHERE slug = 'pole-tents';
UPDATE tent_styles SET image_url = 'https://framerusercontent.com/images/ssFE1sbzHPh22ipaZQPhqIEEas.png?scale-down-to=1024&width=1448&height=1086' WHERE slug = 'frame-tents';
UPDATE tent_styles SET image_url = 'https://framerusercontent.com/images/SSZ4VI1oD1xG798NPBORD9vg.png?scale-down-to=1024&width=1448&height=1086' WHERE slug = 'high-peak-frame-tents';
UPDATE tent_styles SET image_url = 'https://framerusercontent.com/images/g4cg1m7E11BilbdR9dixr0chR8c.png?scale-down-to=1024&width=1448&height=1086' WHERE slug = 'sailcloth-tents';
UPDATE tent_styles SET image_url = 'https://framerusercontent.com/images/O1HC2lTBQ0nh5jkXcR1tOjATe9I.png?scale-down-to=1024&width=1448&height=1086' WHERE slug = 'clear-top-frame-tents';
UPDATE tent_styles SET image_url = 'https://framerusercontent.com/images/MCzVcsFYi2lB32WPmH9CIA0o8mg.png?scale-down-to=1024&width=1448&height=1086' WHERE slug = 'clearspan-structure-tents';
UPDATE tent_styles SET image_url = 'https://framerusercontent.com/images/YrKU0tBtVWbvMDZUwOzB89yn6fE.png?scale-down-to=1024&width=1448&height=1086' WHERE slug = 'party-canopies';
