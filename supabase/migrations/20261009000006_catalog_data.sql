ALTER TABLE accessories ADD COLUMN IF NOT EXISTS category text;

INSERT INTO tent_styles (name, slug, description, price_type, price_cents, sizes, guest_min, guest_max, guest_max_plus, best_for) VALUES
('Pole Tents', 'pole-tents', 'Traditional center-pole construction creates recognizable peaks and an open, festive silhouette. Best installed on grass where the full staking pattern can be used.', 'from', 65000, '20′ × 20′ to 40′ × 100′+', 32, 250, true, 'Weddings, Graduations, Large lawn parties'),
('Frame Tents', 'frame-tents', 'An aluminum frame supports the roof without center poles, giving you a clear interior and more placement flexibility on lawns, patios, or driveways.', 'from', 72500, '10′ × 10′ to 40′ × 100′+', 16, 220, true, 'Backyards, Patios, Dining layouts, Tight sites'),
('High-Peak Frame Tents', 'high-peak-frame-tents', 'A frame-supported tent with a lifted center peak. It delivers a finished event look in smaller footprints without placing a support pole in the guest area.', 'from', 37500, '10′ × 10′ to 20′ × 40′', 8, 64, false, 'Cocktail areas, Showers, Bars, Entrances'),
('Sailcloth Tents', 'sailcloth-tents', 'Translucent sailcloth, rounded ends, and sculpted peaks create warm daytime light and a soft glow after dark. These tents require suitable ground for staking.', 'from', 240000, '32′ × 44′ to 59′ × 119′', 60, 300, true, 'Weddings, Estate dinners, Formal celebrations'),
('Clear-Top Frame Tents', 'clear-top-frame-tents', 'Transparent vinyl roof panels preserve the pole-free frame-tent interior while opening the view overhead. Shade planning is important for warm daytime events.', 'from', 145000, '20′ × 20′ to 40′ × 80′', 32, 170, false, 'Evening receptions, Gardens, Scenic venues'),
('Clearspan Structure Tents', 'clearspan-structure-tents', 'A heavy-duty aluminum structure creates a wide, unobstructed interior. Available configurations may include tensioned roof panels, rigid PVC or glass walls, doors, and integrated flooring.', 'custom_quote', 0, '30′ × 30′ to 100′ × 200′+', 75, 750, true, 'Large events, Long-term installs, Premium enclosures'),
('Party Canopies', 'party-canopies', 'Straightforward overhead cover for casual gatherings where a full event tent is not necessary. An approachable option for smaller guest lists and simple layouts.', 'from', 29500, '10′ × 20′ to 20′ × 40′', 12, 64, false, 'Birthdays, Cookouts, Graduation parties')
ON CONFLICT (slug) DO UPDATE SET 
  description = EXCLUDED.description, 
  price_type = EXCLUDED.price_type, 
  price_cents = EXCLUDED.price_cents, 
  sizes = EXCLUDED.sizes, 
  guest_min = EXCLUDED.guest_min, 
  guest_max = EXCLUDED.guest_max, 
  guest_max_plus = EXCLUDED.guest_max_plus, 
  best_for = EXCLUDED.best_for;

INSERT INTO packages (name, slug, price_type, price_cents, guest_max, tent_size, site_space, includes) VALUES
('The Gathering', 'the-gathering', 'from', 129500, 32, '20′ × 20′ frame tent', 'Approx. 30′ × 30′ clear area', ARRAY['4 round dining tables', '32 white folding chairs', '2 six-foot banquet tables', 'Event layout planning', 'Professional delivery and installation', 'Scheduled disassembly and pickup']),
('The Celebration', 'the-celebration', 'from', 219500, 64, '20′ × 40′ frame tent', 'Approx. 30′ × 50′ clear area', ARRAY['8 round dining tables', '64 white folding chairs', '2 six-foot banquet tables', 'Event layout planning', 'Professional delivery and installation', 'Scheduled disassembly and pickup']),
('The Grand Event', 'the-grand-event', 'from', 329500, 96, '30′ × 45′ frame tent', 'Approx. 45′ × 60′ clear area', ARRAY['12 round dining tables', '96 white folding chairs', '3 six-foot banquet tables', 'Event layout planning', 'Professional delivery and installation', 'Scheduled disassembly and pickup']),
('The Big One', 'the-big-one', 'from', 525000, 144, '40′ × 60′ frame tent', 'Approx. 55′ × 75′ clear area', ARRAY['18 round dining tables', '144 white folding chairs', '4 six-foot banquet tables', 'Event layout planning', 'Professional delivery and installation', 'Scheduled disassembly and pickup'])
ON CONFLICT (slug) DO UPDATE SET
  price_type = EXCLUDED.price_type,
  price_cents = EXCLUDED.price_cents,
  guest_max = EXCLUDED.guest_max,
  tent_size = EXCLUDED.tent_size,
  site_space = EXCLUDED.site_space,
  includes = EXCLUDED.includes;

INSERT INTO accessories (name, slug, category, description, price_type, price_cents) VALUES
('Tent Sidewalls', 'tent-sidewalls', 'Comfort & Protection', 'Solid, clear, or windowed panels that enclose selected sides of the tent.', 'custom_quote', 0),
('Tent Fans', 'tent-fans', 'Comfort & Protection', 'Portable high-output fans that improve airflow inside warm-weather tents.', 'from', 8500),
('Patio Heaters', 'patio-heaters', 'Comfort & Protection', 'Freestanding propane heaters for cooler evenings and shoulder-season gatherings.', 'from', 11000),
('Bistro Lighting', 'bistro-lighting', 'Atmosphere & Movement', 'Warm overhead string lighting installed to suit the tent size and layout.', 'custom_quote', 0),
('Dance Floors', 'dance-floors', 'Atmosphere & Movement', 'Portable finished flooring sized around attendance, entertainment, and available space.', 'from', 65000),
('Uplighting', 'uplighting', 'Atmosphere & Movement', 'Compact accent lighting that adds color and dimension around the tent interior.', 'from', 3500),
('Cocktail Tables', 'cocktail-tables', 'Service & Gathering', 'Standing-height tables for drinks, mingling areas, and casual service.', 'from', 2400),
('Portable Bars', 'portable-bars', 'Service & Gathering', 'Clean mobile bar fronts paired with optional service and cocktail tables.', 'from', 22500),
('Linens', 'linens', 'Service & Gathering', 'Table linens selected around table shape, size, and the event palette.', 'custom_quote', 0),
('Backyard Movie Theater', 'backyard-movie-theater', 'Something Extra', 'Inflatable screen, projector, and speaker package for an outdoor movie night.', 'from', 49500),
('Lawn Games', 'lawn-games', 'Something Extra', 'Casual outdoor games arranged as a flexible add-on for guests of different ages.', 'from', 9500),
('Event Audio', 'event-audio', 'Something Extra', 'Simple amplified sound for announcements, playlists, and casual entertainment.', 'custom_quote', 0)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  price_type = EXCLUDED.price_type,
  price_cents = EXCLUDED.price_cents;
