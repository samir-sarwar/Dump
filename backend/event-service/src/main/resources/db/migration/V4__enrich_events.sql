-- Add cover images and update media counts for seed events

UPDATE events SET image_url = 'https://picsum.photos/seed/rooftop-sunset/800/600', media_count = 5
WHERE id = 'e2000000-0000-0000-0000-000000000001';

UPDATE events SET image_url = 'https://picsum.photos/seed/birthday-bash/800/600', media_count = 6
WHERE id = 'e2000000-0000-0000-0000-000000000002';

UPDATE events SET image_url = 'https://picsum.photos/seed/music-festival/800/600', media_count = 4
WHERE id = 'e2000000-0000-0000-0000-000000000003';

UPDATE events SET image_url = 'https://picsum.photos/seed/food-crawl/800/600', media_count = 5
WHERE id = 'e2000000-0000-0000-0000-000000000004';

UPDATE events SET image_url = 'https://picsum.photos/seed/skatepark-session/800/600', media_count = 4
WHERE id = 'e2000000-0000-0000-0000-000000000005';

UPDATE events SET image_url = 'https://picsum.photos/seed/gallery-opening/800/600', media_count = 5
WHERE id = 'e2000000-0000-0000-0000-000000000006';

UPDATE events SET image_url = 'https://picsum.photos/seed/mountain-hike/800/600', media_count = 4
WHERE id = 'e2000000-0000-0000-0000-000000000007';

UPDATE events SET image_url = 'https://picsum.photos/seed/graduation-party/800/600', media_count = 4
WHERE id = 'e2000000-0000-0000-0000-000000000008';
