ALTER TABLE accessories ADD COLUMN IF NOT EXISTS image_url text;

UPDATE accessories SET image_url = 'https://framerusercontent.com/images/RbBcZ5UKmk37V1y8PpT4N1oJII.png?scale-down-to=1024&width=1448&height=1086' WHERE slug = 'tent-sidewalls';
UPDATE accessories SET image_url = 'https://framerusercontent.com/images/Sd2xIJfv6COu7YvzGBZKSm7NYQ.png?scale-down-to=512&width=1448&height=1086' WHERE slug = 'tent-fans';
UPDATE accessories SET image_url = 'https://framerusercontent.com/images/N5sfQHM5w5Ukuzrc1LgBHDXPbCg.png?scale-down-to=512&width=1448&height=1086' WHERE slug = 'patio-heaters';

UPDATE accessories SET image_url = 'https://framerusercontent.com/images/bv4LYmLRACRjR8J4oZlfI0Tbfc8.png?scale-down-to=1024&width=1448&height=1086' WHERE slug = 'bistro-lighting';
UPDATE accessories SET image_url = 'https://framerusercontent.com/images/oG9Xn5xmy6MTe8JON0c36fS8rk.png?scale-down-to=1024&width=1448&height=1086' WHERE slug = 'dance-floors';
UPDATE accessories SET image_url = 'https://framerusercontent.com/images/AuDjIqlM2hAy5yCnPOSZFD3nI.png?scale-down-to=512&width=1448&height=1086' WHERE slug = 'uplighting';

UPDATE accessories SET image_url = 'https://framerusercontent.com/images/emDWckDNCbQLIk57gjIkR9BLK0.png?scale-down-to=512&width=1448&height=1086' WHERE slug = 'cocktail-tables';
UPDATE accessories SET image_url = 'https://framerusercontent.com/images/pSbwsTYCSoqJ8nqQGTw4eBYyl0Y.png?scale-down-to=512&width=1448&height=1086' WHERE slug = 'portable-bars';
UPDATE accessories SET image_url = 'https://framerusercontent.com/images/ava02oVdaSVAAA77UvuyWrI8t4Q.png?scale-down-to=512&width=1448&height=1086' WHERE slug = 'linens';

UPDATE accessories SET image_url = 'https://framerusercontent.com/images/xghN2o1q01hlin89346uPSRFSY.png?scale-down-to=1024&width=1448&height=1086' WHERE slug = 'backyard-movie-theater';
UPDATE accessories SET image_url = 'https://framerusercontent.com/images/JXn2Z3pRD1zonoDtwLXaCmDDSo.png?scale-down-to=512&width=1448&height=1086' WHERE slug = 'lawn-games';
UPDATE accessories SET image_url = 'https://framerusercontent.com/images/ILb7ZEWuHmdb8xVt6FEAyg7F3H0.png?scale-down-to=512&width=1448&height=1086' WHERE slug = 'event-audio';
