-- =====================================================
-- DEMO DATA - Демо данные для разработки
-- =====================================================

-- Очистка существующих демо данных
DELETE FROM notifications WHERE user_id IN (SELECT id FROM users_extended WHERE email LIKE '%@demo.promo.fm');
DELETE FROM transactions WHERE user_id IN (SELECT id FROM users_extended WHERE email LIKE '%@demo.promo.fm');
DELETE FROM pitching_requests WHERE user_id IN (SELECT id FROM users_extended WHERE email LIKE '%@demo.promo.fm');
DELETE FROM news WHERE user_id IN (SELECT id FROM users_extended WHERE email LIKE '%@demo.promo.fm');
DELETE FROM concerts WHERE user_id IN (SELECT id FROM users_extended WHERE email LIKE '%@demo.promo.fm');
DELETE FROM videos WHERE user_id IN (SELECT id FROM users_extended WHERE email LIKE '%@demo.promo.fm');
DELETE FROM tracks WHERE user_id IN (SELECT id FROM users_extended WHERE email LIKE '%@demo.promo.fm');
DELETE FROM users_extended WHERE email LIKE '%@demo.promo.fm';

-- =====================================================
-- DEMO USERS
-- =====================================================
INSERT INTO users_extended (username, display_name, email, role, status, verified, avatar_url, bio, location, followers_count, total_plays, balance, coins_balance, subscription_tier) VALUES
-- Artists
('djmaestro', 'DJ Maestro', 'artist1@demo.promo.fm', 'artist', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=maestro', 'Electronic music producer & DJ from Moscow', 'Москва, Россия', 12500, 2345000, 45230.50, 1250, 'pro'),
('annasinger', 'Anna Singer', 'artist2@demo.promo.fm', 'artist', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=anna', 'Pop singer-songwriter', 'Санкт-Петербург', 8900, 1234000, 23450.00, 890, 'basic'),
('rockband', 'Rock Warriors', 'artist3@demo.promo.fm', 'artist', 'active', false, 'https://api.dicebear.com/7.x/avataaars/svg?seed=rock', 'Rock band since 2015', 'Екатеринбург', 5600, 890000, 12300.00, 450, 'free'),

-- DJs
('djspin', 'DJ Spin Master', 'dj1@demo.promo.fm', 'dj', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=spin', 'Club DJ & Radio Host', 'Москва', 15600, 3456000, 56780.00, 2340, 'premium'),
('djnight', 'Night Mixer', 'dj2@demo.promo.fm', 'dj', 'pending', false, 'https://api.dicebear.com/7.x/avataaars/svg?seed=night', 'Underground techno DJ', 'Казань', 3400, 456000, 8900.00, 230, 'free'),

-- Labels
('promolab', 'Promo Lab Records', 'label1@demo.promo.fm', 'label', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=lab', 'Independent music label', 'Москва', 23400, 8900000, 234500.00, 5600, 'premium'),
('indiemusic', 'Indie Music Co', 'label2@demo.promo.fm', 'label', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=indie', 'Indie & Alternative label', 'СПб', 12300, 4500000, 123400.00, 3400, 'pro'),

-- Venues
('clubmoscow', 'Moscow Night Club', 'venue1@demo.promo.fm', 'venue', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=club', 'Premier nightclub in Moscow', 'Москва', 45600, 0, 89000.00, 1200, 'pro'),
('arenaspb', 'Arena SPB', 'venue2@demo.promo.fm', 'venue', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=arena', 'Concert venue', 'СПб', 34500, 0, 67800.00, 890, 'basic'),

-- Radio
('radiowave', 'Radio Wave FM', 'radio1@demo.promo.fm', 'radio', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=wave', 'Top 40 radio station', 'Москва', 234000, 0, 456000.00, 8900, 'premium'),
('rockfm', 'Rock FM', 'radio2@demo.promo.fm', 'radio', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=rockfm', 'Rock music 24/7', 'Екатеринбург', 123000, 0, 234000.00, 4500, 'pro'),

-- Pending users
('newartist', 'New Artist', 'pending1@demo.promo.fm', 'artist', 'pending', false, 'https://api.dicebear.com/7.x/avataaars/svg?seed=new1', 'Just registered', 'Новосибирск', 0, 0, 0, 0, 'free'),
('newdj', 'Fresh DJ', 'pending2@demo.promo.fm', 'dj', 'pending', false, 'https://api.dicebear.com/7.x/avataaars/svg?seed=new2', 'New to the platform', 'Казань', 0, 0, 0, 0, 'free');

-- =====================================================
-- DEMO TRACKS
-- =====================================================
INSERT INTO tracks (user_id, title, artist_name, genre, subgenre, audio_url, cover_url, duration_seconds, status, plays_count, likes_count, bpm, created_at)
SELECT 
  u.id,
  t.title,
  t.artist_name,
  t.genre,
  t.subgenre,
  'https://example.com/audio/' || t.title || '.mp3',
  'https://picsum.photos/seed/' || t.title || '/400/400',
  t.duration,
  t.status,
  t.plays,
  t.likes,
  t.bpm,
  NOW() - (random() * interval '30 days')
FROM users_extended u
CROSS JOIN (VALUES
  ('Summer Vibes', 'DJ Maestro', 'Electronic', 'House', 180, 'pending', 0, 0, 128),
  ('Night Drive', 'DJ Maestro', 'Electronic', 'Techno', 210, 'approved', 45678, 3456, 130),
  ('Sunset Dreams', 'DJ Maestro', 'Electronic', 'Chillout', 240, 'approved', 123456, 8900, 95),
  ('Love Song', 'Anna Singer', 'Pop', 'Ballad', 195, 'pending', 0, 0, 80),
  ('Dance All Night', 'Anna Singer', 'Pop', 'Dance-Pop', 175, 'approved', 234567, 12300, 125),
  ('Rock Anthem', 'Rock Warriors', 'Rock', 'Hard Rock', 225, 'pending', 0, 0, 140),
  ('Electric Soul', 'DJ Spin Master', 'Electronic', 'Progressive', 300, 'approved', 567890, 23400, 128),
  ('Underground Beat', 'Night Mixer', 'Electronic', 'Techno', 420, 'pending', 0, 0, 135),
  ('Morning Light', 'Anna Singer', 'Pop', 'Indie Pop', 165, 'rejected', 0, 0, 90),
  ('Heavy Metal Thunder', 'Rock Warriors', 'Rock', 'Metal', 280, 'approved', 345678, 15600, 160)
) t(title, artist_name, genre, subgenre, duration, status, plays, likes, bpm)
WHERE u.username IN ('djmaestro', 'annasinger', 'rockband', 'djspin', 'djnight');

-- =====================================================
-- DEMO VIDEOS
-- =====================================================
INSERT INTO videos (user_id, title, description, video_url, thumbnail_url, duration_seconds, status, views_count, likes_count, created_at)
SELECT 
  u.id,
  v.title,
  v.description,
  'https://example.com/video/' || v.title || '.mp4',
  'https://picsum.photos/seed/video' || v.title || '/640/360',
  v.duration,
  v.status,
  v.views,
  v.likes,
  NOW() - (random() * interval '20 days')
FROM users_extended u
CROSS JOIN (VALUES
  ('Summer Vibes - Official Video', 'Official music video', 180, 'pending', 0, 0),
  ('Night Drive - Live Session', 'Live performance', 210, 'approved', 45678, 2340),
  ('Dance All Night - Behind the Scenes', 'BTS footage', 420, 'pending', 0, 0),
  ('Rock Anthem - Concert', 'Live concert footage', 300, 'approved', 123456, 8900),
  ('Electric Soul - Visualizer', 'Audio visualizer', 300, 'pending', 0, 0)
) v(title, description, duration, status, views, likes)
WHERE u.username IN ('djmaestro', 'annasinger', 'rockband', 'djspin');

-- =====================================================
-- DEMO CONCERTS
-- =====================================================
INSERT INTO concerts (user_id, title, description, type, city, venue, event_date, event_time, ticket_price_from, ticket_price_to, banner_url, status, views_count, interested_count, created_at)
SELECT 
  u.id,
  c.title,
  c.description,
  c.type,
  c.city,
  c.venue,
  CURRENT_DATE + (c.days_offset || ' days')::INTERVAL,
  c.time,
  c.price_from,
  c.price_to,
  'https://picsum.photos/seed/concert' || c.title || '/1200/600',
  c.status,
  c.views,
  c.interested,
  NOW() - (random() * interval '10 days')
FROM users_extended u
CROSS JOIN (VALUES
  ('Summer Festival 2026', 'Biggest electronic music festival', 'festival', 'Москва', 'Парк Горького', 45, '20:00', 2500.00, 8000.00, 'pending', 0, 0),
  ('Night Drive Tour - Moscow', 'Album presentation tour', 'concert', 'Москва', 'Adrenaline Stadium', 30, '19:00', 1500.00, 5000.00, 'approved', 12345, 890),
  ('Rock Warriors Live', 'Rock concert', 'concert', 'Екатеринбург', 'Rock Club', 15, '21:00', 500.00, 1500.00, 'pending', 0, 0),
  ('Anna Singer Acoustic', 'Intimate acoustic show', 'club', 'Санкт-Петербург', 'Jazz Club', 7, '19:30', 800.00, 2000.00, 'approved', 5678, 456)
) c(title, description, type, city, venue, days_offset, time, price_from, price_to, status, views, interested)
WHERE u.username IN ('djmaestro', 'annasinger', 'rockband');

-- =====================================================
-- DEMO NEWS
-- =====================================================
INSERT INTO news (user_id, title, preview, content, cover_url, category, status, views_count, likes_count, created_at)
SELECT 
  u.id,
  n.title,
  n.preview,
  n.content,
  'https://picsum.photos/seed/news' || n.title || '/800/600',
  n.category,
  n.status,
  n.views,
  n.likes,
  NOW() - (random() * interval '15 days')
FROM users_extended u
CROSS JOIN (VALUES
  ('New Album Release', 'Excited to announce my new album', 'After months of hard work, I am thrilled to announce my new album "Summer Dreams" will be released next month. This album represents my musical journey...', 'release', 'pending', 0, 0),
  ('Festival Announcement', 'Playing at Summer Festival 2026', 'I will be headlining the Summer Festival 2026 in Moscow! Join me for an unforgettable night of music and energy. Tickets available now.', 'announcement', 'approved', 23456, 1890),
  ('Studio Session', 'Working on new tracks', 'Been spending days in the studio working on some exciting new material. Cannot wait to share it with you all!', 'announcement', 'pending', 0, 0),
  ('Tour Dates Announced', 'Russia tour starting next month', 'Excited to announce my Russia tour! Will be visiting Moscow, St. Petersburg, and more cities. Check dates and get your tickets.', 'event', 'approved', 45678, 3456)
) n(title, preview, content, category, status, views, likes)
WHERE u.username IN ('djmaestro', 'annasinger');

-- =====================================================
-- DEMO PITCHING REQUESTS
-- =====================================================
INSERT INTO pitching_requests (user_id, track_id, campaign_name, target_channels, basic_service, premium_distribution, base_price, discount_percent, final_price, status, created_at)
SELECT 
  u.id,
  t.id,
  'Pitching: ' || t.title,
  ARRAY['radio', 'playlist', 'blog']::TEXT[],
  true,
  false,
  5000.00,
  0,
  5000.00,
  p.status,
  NOW() - (random() * interval '5 days')
FROM users_extended u
JOIN tracks t ON t.user_id = u.id
CROSS JOIN (VALUES
  ('pending'),
  ('in_progress'),
  ('pending')
) p(status)
WHERE u.username IN ('djmaestro', 'annasinger')
LIMIT 5;

-- =====================================================
-- DEMO TRANSACTIONS
-- =====================================================
INSERT INTO transactions (user_id, type, amount, description, status, created_at)
SELECT 
  u.id,
  t.type,
  t.amount,
  t.description,
  t.status,
  NOW() - (random() * interval '30 days')
FROM users_extended u
CROSS JOIN (VALUES
  ('deposit', 10000.00, 'Пополнение баланса', 'completed'),
  ('purchase', 5000.00, 'Pitching campaign', 'completed'),
  ('earning', 2340.50, 'Royalties from streams', 'completed'),
  ('withdrawal', 15000.00, 'Вывод средств', 'pending'),
  ('deposit', 5000.00, 'Пополнение баланса', 'completed')
) t(type, amount, description, status)
WHERE u.username IN ('djmaestro', 'annasinger', 'djspin')
LIMIT 50;

-- =====================================================
-- DEMO NOTIFICATIONS
-- =====================================================
INSERT INTO notifications (user_id, type, title, message, is_read, priority, created_at)
SELECT 
  u.id,
  n.type,
  n.title,
  n.message,
  n.is_read,
  n.priority,
  NOW() - (random() * interval '7 days')
FROM users_extended u
CROSS JOIN (VALUES
  ('moderation', 'Трек одобрен ✅', 'Ваш трек прошел модерацию и опубликован!', false, 'normal'),
  ('payment', 'Выплата обработана', 'Ваш запрос на выплату был обработан', true, 'high'),
  ('social', 'Новый подписчик', 'У вас новый подписчик!', true, 'low'),
  ('system', 'Добро пожаловать!', 'Спасибо за регистрацию на PROMO.MUSIC', true, 'normal'),
  ('marketing', 'Специальное предложение', 'Скидка 20% на питчинг сегодня!', false, 'normal')
) n(type, title, message, is_read, priority)
WHERE u.username IN ('djmaestro', 'annasinger')
LIMIT 20;
