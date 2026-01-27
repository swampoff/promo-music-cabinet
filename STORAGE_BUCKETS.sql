-- ========================================
-- STORAGE BUCKETS SETUP
-- Выполнить в Supabase Dashboard -> SQL Editor
-- ========================================

-- Создание bucket для аватаров
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Создание bucket для обложек треков
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'track-covers',
  'track-covers',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Создание bucket для аудио файлов
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio',
  'audio',
  false,
  104857600, -- 100MB
  ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac']
)
ON CONFLICT (id) DO NOTHING;

-- Создание bucket для видео
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  false,
  524288000, -- 500MB
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Создание bucket для баннеров
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banners',
  'banners',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Создание bucket для новостей
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'news',
  'news',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Создание bucket для концертов
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'concerts',
  'concerts',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- RLS POLICIES FOR STORAGE
-- ========================================

-- Политики для avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Политики для track-covers
CREATE POLICY "Track covers are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'track-covers');

CREATE POLICY "Users can upload track covers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'track-covers' AND auth.role() = 'authenticated');

-- Политики для banners
CREATE POLICY "Banners are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

CREATE POLICY "Users can upload banners"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'banners' AND auth.role() = 'authenticated');

-- Политики для news
CREATE POLICY "News images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'news');

CREATE POLICY "Users can upload news images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'news' AND auth.role() = 'authenticated');

-- Политики для concerts
CREATE POLICY "Concert images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'concerts');

CREATE POLICY "Users can upload concert images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'concerts' AND auth.role() = 'authenticated');

-- Политики для audio (приватный)
CREATE POLICY "Users can access their own audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio' AND auth.role() = 'authenticated');

CREATE POLICY "Users can upload audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audio' AND auth.role() = 'authenticated');

-- Политики для videos (приватный)
CREATE POLICY "Users can access their own videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

-- ========================================
-- DONE
-- ========================================
SELECT 'Storage buckets created successfully!' as status;
