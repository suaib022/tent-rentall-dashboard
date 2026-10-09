INSERT INTO settings (key, value) VALUES
('business_timezone', '"America/New_York"'),
('hold_hours', '48'),
('quote_valid_days', '14'),
('tax_rate', '0.08625'),
('max_installs_per_day', '3'),
('min_lead_time_days', '7'),
('business_hours', '{"start": "09:00", "end": "17:00"}');

-- Tent Styles
INSERT INTO tent_styles (name, slug, description, price_type, price_cents, sizes, guest_min, guest_max, guest_max_plus, best_for) VALUES
('Pole Tents', 'pole-tents', 'Classic sweeping peaks.', 'from', 65000, '20x20 to 40x100+', 32, 250, true, 'weddings, graduations, large lawn parties (needs grass for staking)'),
('Frame Tents', 'frame-tents', 'Versatile open floor plan without center poles.', 'from', 72500, '10x10 to 40x100+', 16, 220, true, 'backyards, patios, dining layouts, tight sites'),
('High-Peak Frame Tents', 'high-peak-frame-tents', 'Elegant peak design without center poles.', 'from', 37500, '10x10 to 20x40', 8, 64, false, 'cocktail areas, showers, bars, entrances'),
('Sailcloth Tents', 'sailcloth-tents', 'Translucent fabric with wooden poles.', 'from', 240000, '32x44 to 59x119', 60, 300, true, 'weddings, estate dinners (needs stakeable ground)'),
('Clear-Top Frame Tents', 'clear-top-frame-tents', 'Transparent roof panels.', 'from', 145000, '20x20 to 40x80', 32, 170, false, 'evening receptions, gardens (needs shade planning)'),
('Clearspan Structure Tents', 'clearspan-structure-tents', 'Heavy duty structures for large events.', 'custom_quote', 0, '30x30 to 100x200+', 75, 750, true, 'large events, long-term installs'),
('Party Canopies', 'party-canopies', 'Lightweight shade for casual events.', 'from', 29500, '10x20 to 20x40', 12, 64, false, 'birthdays, cookouts, graduation parties');

-- Packages
INSERT INTO packages (name, slug, price_type, price_cents, guest_max, tent_size, site_space, includes) VALUES
('The Gathering', 'the-gathering', 'from', 129500, 32, '20x20 frame tent', 'site 30x30', ARRAY['4 round tables', '32 white folding chairs', '2 six-foot banquet tables']),
('The Celebration', 'the-celebration', 'from', 219500, 64, '20x40 frame', 'site 30x50', ARRAY['8 round', '64 chairs', '2 banquet']),
('The Grand Event', 'the-grand-event', 'from', 329500, 96, '30x45 frame', 'site 45x60', ARRAY['12 round', '96 chairs', '3 banquet']),
('The Big One', 'the-big-one', 'from', 525000, 144, '40x60 frame', 'site 55x75', ARRAY['18 round', '144 chairs', '4 banquet']),
('Custom Package', 'custom-package', 'custom_quote', 0, null, null, null, null);

-- Addon Packages
INSERT INTO addon_packages (name, slug, description, price_type, price_cents, includes) VALUES
('Weather-Ready', 'weather-ready', 'Be prepared for any weather', 'custom_quote', 0, ARRAY['sidewalls', 'fans or patio heaters']),
('After-Dark', 'after-dark', 'Lighting for evening events', 'custom_quote', 0, ARRAY['bistro lighting', 'LED uplights', 'professional install']),
('Dance Party', 'dance-party', 'Everything you need to dance', 'custom_quote', 0, ARRAY['dance floor', 'accent uplighting', 'compact audio']),
('Backyard Fun', 'backyard-fun', 'Entertainment for everyone', 'custom_quote', 0, ARRAY['movie screen and projector', 'portable speakers', 'lawn games']);

-- Accessories
INSERT INTO accessories (name, slug, price_type, price_cents) VALUES
('Tent Sidewalls', 'tent-sidewalls', 'custom_quote', 0),
('Tent Fans', 'tent-fans', 'from', 8500),
('Patio Heaters', 'patio-heaters', 'from', 11000),
('Bistro Lighting', 'bistro-lighting', 'custom_quote', 0),
('Dance Floors', 'dance-floors', 'from', 65000),
('Uplighting', 'uplighting', 'from', 3500),
('Cocktail Tables', 'cocktail-tables', 'from', 2400),
('Portable Bars', 'portable-bars', 'from', 22500),
('Linens', 'linens', 'custom_quote', 0),
('Backyard Movie Theater', 'backyard-movie-theater', 'from', 49500),
('Lawn Games', 'lawn-games', 'from', 9500),
('Event Audio', 'event-audio', 'custom_quote', 0);
