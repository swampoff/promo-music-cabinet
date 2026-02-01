/**
 * Полная миграция promo.fm -> PROMO.MUSIC
 *
 * Запуск: npx tsx setup-and-migrate.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config as dotenvConfig } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: path.join(__dirname, '.env') });

// ============================================
// КОНФИГУРАЦИЯ
// ============================================

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// ============================================
// ПАРСЕР SQL (улучшенный)
// ============================================

function parseAllInserts(sql: string, tableName: string): any[] {
  const results: any[] = [];
  const insertRegex = new RegExp(
    `INSERT INTO \`${tableName}\` \\(([^)]+)\\) VALUES\\s*([\\s\\S]*?)(?=INSERT INTO|CREATE TABLE|$)`,
    'gi'
  );

  let match;
  while ((match = insertRegex.exec(sql)) !== null) {
    const columnsStr = match[1];
    const valuesStr = match[2];

    const columns = columnsStr.split(',').map(c => c.replace(/`/g, '').trim());

    // Парсим VALUES
    const rows = extractRows(valuesStr);

    for (const row of rows) {
      const values = parseRowValues(row);
      if (values.length === columns.length) {
        const obj: any = {};
        columns.forEach((col, i) => {
          obj[col] = values[i];
        });
        results.push(obj);
      }
    }
  }

  return results;
}

function extractRows(valuesStr: string): string[] {
  const rows: string[] = [];
  let current = '';
  let depth = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < valuesStr.length; i++) {
    const char = valuesStr[i];
    const prev = valuesStr[i - 1];

    // Обработка строк
    if (!inString && (char === "'" || char === '"') && prev !== '\\') {
      inString = true;
      stringChar = char;
      current += char;
    } else if (inString && char === stringChar && prev !== '\\') {
      inString = false;
      current += char;
    } else if (!inString && char === '(') {
      if (depth === 0) {
        current = '';
      } else {
        current += char;
      }
      depth++;
    } else if (!inString && char === ')') {
      depth--;
      if (depth === 0) {
        if (current.trim()) {
          rows.push(current);
        }
      } else {
        current += char;
      }
    } else if (depth > 0) {
      current += char;
    }
  }

  return rows;
}

function parseRowValues(row: string): any[] {
  const values: any[] = [];
  let current = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const prev = row[i - 1];

    if (!inString && (char === "'" || char === '"') && prev !== '\\') {
      inString = true;
      stringChar = char;
      current += char;
    } else if (inString && char === stringChar && prev !== '\\') {
      inString = false;
      current += char;
    } else if (!inString && char === ',') {
      values.push(cleanValue(current.trim()));
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    values.push(cleanValue(current.trim()));
  }

  return values;
}

function cleanValue(val: string): any {
  if (val === 'NULL' || val === 'null') return null;
  if (/^-?\d+$/.test(val)) return parseInt(val);
  if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val);

  if ((val.startsWith("'") && val.endsWith("'")) ||
      (val.startsWith('"') && val.endsWith('"'))) {
    return val.slice(1, -1)
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\\\/g, '\\')
      .replace(/&#039;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }

  return val;
}

// ============================================
// СОЗДАНИЕ ТАБЛИЦ
// ============================================

async function setupTables() {
  console.log('\n📋 Создание таблиц...\n');

  const createTableSQL = `
    -- Профили артистов
    CREATE TABLE IF NOT EXISTS artist_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      legacy_user_id INTEGER UNIQUE,
      display_name VARCHAR(255) NOT NULL,
      bio TEXT,
      artist_type VARCHAR(20) DEFAULT 'solo',
      founded_year INTEGER,
      label_name VARCHAR(255),
      city VARCHAR(255),
      region VARCHAR(255),
      country VARCHAR(255) DEFAULT 'Россия',
      genres TEXT[] DEFAULT '{}',
      social_links JSONB DEFAULT '{}',
      streaming_links JSONB DEFAULT '{}',
      contact_email VARCHAR(255),
      contact_phone VARCHAR(64),
      avatar_url TEXT,
      cover_image_url TEXT,
      status VARCHAR(20) DEFAULT 'active',
      total_tracks INTEGER DEFAULT 0,
      total_videos INTEGER DEFAULT 0,
      is_verified BOOLEAN DEFAULT FALSE,
      migrated_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Треки
    CREATE TABLE IF NOT EXISTS tracks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      legacy_track_id INTEGER UNIQUE,
      artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      genre VARCHAR(100),
      duration INTEGER DEFAULT 0,
      audio_url TEXT,
      cover_url TEXT,
      language VARCHAR(10) DEFAULT 'ru',
      has_vocal BOOLEAN DEFAULT TRUE,
      is_remix BOOLEAN DEFAULT FALSE,
      featuring_artists TEXT[],
      credits JSONB DEFAULT '{}',
      rights_holder VARCHAR(255),
      label_name VARCHAR(255),
      status VARCHAR(20) DEFAULT 'draft',
      moderation_status VARCHAR(20) DEFAULT 'draft',
      rejection_reason TEXT,
      current_rank INTEGER DEFAULT 0,
      plays INTEGER DEFAULT 0,
      downloads INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      is_promoted BOOLEAN DEFAULT FALSE,
      legacy_file_path TEXT,
      migrated_at TIMESTAMPTZ,
      approved_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Видео
    CREATE TABLE IF NOT EXISTS videos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      legacy_clip_id INTEGER UNIQUE,
      artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
      track_id UUID REFERENCES tracks(id),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      video_type VARCHAR(50) DEFAULT 'music_video',
      video_url TEXT,
      thumbnail_url TEXT,
      youtube_url TEXT,
      external_embed TEXT,
      duration INTEGER DEFAULT 0,
      credits JSONB DEFAULT '{}',
      tags TEXT[] DEFAULT '{}',
      status VARCHAR(20) DEFAULT 'draft',
      moderation_status VARCHAR(20) DEFAULT 'draft',
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      is_promoted BOOLEAN DEFAULT FALSE,
      legacy_file_path TEXT,
      migrated_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Индексы
    CREATE INDEX IF NOT EXISTS idx_artist_profiles_legacy ON artist_profiles(legacy_user_id);
    CREATE INDEX IF NOT EXISTS idx_tracks_artist ON tracks(artist_id);
    CREATE INDEX IF NOT EXISTS idx_tracks_legacy ON tracks(legacy_track_id);
    CREATE INDEX IF NOT EXISTS idx_videos_artist ON videos(artist_id);
    CREATE INDEX IF NOT EXISTS idx_videos_legacy ON videos(legacy_clip_id);
  `;

  const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });

  if (error) {
    // Если RPC не работает, таблицы возможно уже есть
    console.log('   Таблицы уже существуют или созданы через Dashboard');
  } else {
    console.log('   ✅ Таблицы созданы');
  }
}

// ============================================
// ИМПОРТ ПОЛЬЗОВАТЕЛЕЙ
// ============================================

async function importUsers(users: any[]): Promise<Map<number, string>> {
  console.log('\n👥 Импорт пользователей...\n');

  const artistMap = new Map<number, string>();

  // Фильтруем артистов (группы 1 и 2)
  const artists = users.filter(u =>
    (u.group === 1 || u.group === 2) &&
    u.email &&
    u.email.includes('@')
  );

  console.log(`   Всего артистов: ${artists.length}`);

  // Убираем дубликаты email
  const seenEmails = new Set<string>();
  const uniqueArtists = artists.filter(a => {
    const email = a.email.toLowerCase().trim();
    if (seenEmails.has(email)) return false;
    seenEmails.add(email);
    return true;
  });

  console.log(`   Уникальных: ${uniqueArtists.length}`);

  let created = 0;
  let existing = 0;
  let failed = 0;

  for (let i = 0; i < uniqueArtists.length; i++) {
    const artist = uniqueArtists[i];
    const email = artist.email.toLowerCase().trim();

    try {
      // Сначала проверим, есть ли уже профиль с этим legacy_user_id
      const { data: existingProfile } = await supabase
        .from('artist_profiles')
        .select('id')
        .eq('legacy_user_id', artist.id)
        .single();

      if (existingProfile) {
        artistMap.set(artist.id, existingProfile.id);
        existing++;
        continue;
      }

      // Создаём пользователя в Auth
      const password = Math.random().toString(36).slice(-10) + 'Aa1!';
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          legacy_user_id: artist.id,
          display_name: artist.ProfileArtistName || `Артист #${artist.id}`,
        },
      });

      let userId: string;

      if (authError) {
        if (authError.message.includes('already')) {
          // Пользователь уже существует, находим его
          const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers();
          const existingUser = existingUsers?.find(u => u.email === email);
          if (existingUser) {
            userId = existingUser.id;
          } else {
            failed++;
            continue;
          }
        } else {
          failed++;
          continue;
        }
      } else {
        userId = authData.user.id;
      }

      // Создаём профиль
      const socialLinks: Record<string, string> = {};
      if (artist.ProfileVkontakte) socialLinks.vk = artist.ProfileVkontakte;
      if (artist.ProfileFacebook) socialLinks.facebook = artist.ProfileFacebook;
      if (artist.Profileinst) socialLinks.instagram = artist.Profileinst;
      if (artist.ProfileTwitter) socialLinks.twitter = artist.ProfileTwitter;
      if (artist.ProfileTiktok) socialLinks.tiktok = artist.ProfileTiktok;
      if (artist.ProfileSite) socialLinks.website = artist.ProfileSite;

      const streamingLinks: Record<string, string> = {};
      if (artist.ProfileSpotify) streamingLinks.spotify = artist.ProfileSpotify;
      if (artist.ProfileMusic) streamingLinks.apple_music = artist.ProfileMusic;

      const { data: profile, error: profileError } = await supabase
        .from('artist_profiles')
        .insert({
          user_id: userId,
          legacy_user_id: artist.id,
          display_name: artist.ProfileArtistName || `Артист #${artist.id}`,
          bio: artist.ProfileArtistAbout || null,
          artist_type: artist.group === 1 ? 'solo' : 'band',
          founded_year: artist.ProfileArtistFoundation || null,
          label_name: artist.ProfileLabel || null,
          city: artist.ProfileCity || null,
          country: 'Россия',
          genres: artist.ProfileArtistStyle ? [artist.ProfileArtistStyle] : [],
          social_links: Object.keys(socialLinks).length > 0 ? socialLinks : {},
          streaming_links: Object.keys(streamingLinks).length > 0 ? streamingLinks : {},
          contact_email: artist.ProfileEmail || null,
          contact_phone: artist.ProfilePhone || null,
          status: 'active',
          migrated_at: new Date().toISOString(),
          created_at: artist.reg_date
            ? new Date(artist.reg_date * 1000).toISOString()
            : new Date().toISOString(),
        })
        .select('id')
        .single();

      if (profileError) {
        console.error(`   ❌ Профиль ${email}: ${profileError.message}`);
        failed++;
        continue;
      }

      artistMap.set(artist.id, profile.id);
      created++;

      if ((created + existing) % 100 === 0) {
        console.log(`   Прогресс: ${created + existing}/${uniqueArtists.length}`);
      }
    } catch (err) {
      failed++;
    }
  }

  console.log(`\n   ✅ Создано: ${created}`);
  console.log(`   📌 Уже было: ${existing}`);
  console.log(`   ❌ Ошибок: ${failed}`);

  return artistMap;
}

// ============================================
// ИМПОРТ ТРЕКОВ
// ============================================

async function importTracks(tracks: any[], artistMap: Map<number, string>) {
  console.log('\n🎵 Импорт треков...\n');

  const statusMap: Record<number, { status: string; moderation: string }> = {
    0: { status: 'draft', moderation: 'pending' },
    1: { status: 'published', moderation: 'approved' },
    2: { status: 'draft', moderation: 'rejected' },
    3: { status: 'archived', moderation: 'approved' },
  };

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  // Батчами по 50
  const batchSize = 50;

  for (let i = 0; i < tracks.length; i += batchSize) {
    const batch = tracks.slice(i, i + batchSize);

    const toInsert = batch
      .map(track => {
        const artistId = artistMap.get(track.user_id);
        if (!artistId) {
          skipped++;
          return null;
        }

        const statusInfo = statusMap[track.status] || statusMap[0];

        return {
          legacy_track_id: track.id,
          artist_id: artistId,
          title: track.songname || `Трек #${track.id}`,
          description: track.information || null,
          genre: track.song_style || null,
          duration: (track.songtime_m || 0) * 60 + (track.songtime_s || 0),
          language: track.language || 'ru',
          has_vocal: track.vocal === 1,
          is_remix: track.remix === 1,
          credits: {
            lyrics: track.song_authors || null,
            music: track.music_authors || null,
          },
          rights_holder: track.song_rights || null,
          label_name: track.label || null,
          status: track.archive === 1 ? 'archived' : statusInfo.status,
          moderation_status: statusInfo.moderation,
          rejection_reason: track.status === 2 ? track.delete_reason : null,
          current_rank: track.cur_rank || 0,
          legacy_file_path: track.file_uploaded || null,
          audio_url: track.file_uploaded
            ? `legacy/tracks/${track.user_id}/${track.file_uploaded}`
            : null,
          migrated_at: new Date().toISOString(),
          created_at: track.date_added
            ? new Date(track.date_added * 1000).toISOString()
            : new Date().toISOString(),
          approved_at: track.date_approved_unix && track.date_approved_unix > 0
            ? new Date(track.date_approved_unix * 1000).toISOString()
            : null,
        };
      })
      .filter(t => t !== null);

    if (toInsert.length > 0) {
      const { error } = await supabase
        .from('tracks')
        .upsert(toInsert, { onConflict: 'legacy_track_id' });

      if (error) {
        console.error(`   ❌ Батч ${i}: ${error.message}`);
        failed += toInsert.length;
      } else {
        imported += toInsert.length;
      }
    }

    if ((i + batchSize) % 500 === 0 || i + batchSize >= tracks.length) {
      console.log(`   Прогресс: ${Math.min(i + batchSize, tracks.length)}/${tracks.length}`);
    }
  }

  console.log(`\n   ✅ Импортировано: ${imported}`);
  console.log(`   ⏭️ Пропущено (нет артиста): ${skipped}`);
  console.log(`   ❌ Ошибок: ${failed}`);
}

// ============================================
// ИМПОРТ ВИДЕО
// ============================================

async function importVideos(clips: any[], artistMap: Map<number, string>) {
  console.log('\n🎬 Импорт видео...\n');

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  const batchSize = 50;

  for (let i = 0; i < clips.length; i += batchSize) {
    const batch = clips.slice(i, i + batchSize);

    const toInsert = batch
      .map(clip => {
        const artistId = artistMap.get(clip.user_id);
        if (!artistId) {
          skipped++;
          return null;
        }

        // Извлекаем YouTube URL
        let youtubeUrl = null;
        if (clip.embed) {
          const match = clip.embed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/i);
          if (match) {
            youtubeUrl = `https://www.youtube.com/watch?v=${match[1]}`;
          }
        }

        return {
          legacy_clip_id: clip.id,
          artist_id: artistId,
          title: clip.songname || `Видео #${clip.id}`,
          description: clip.information || null,
          video_type: 'music_video',
          youtube_url: youtubeUrl,
          external_embed: clip.embed || null,
          duration: (clip.songtime_m || 0) * 60 + (clip.songtime_s || 0),
          credits: clip.director ? { director: clip.director } : {},
          tags: clip.song_style ? [clip.song_style] : [],
          status: clip.status === 1 ? 'published' : 'draft',
          moderation_status: clip.status === 1 ? 'approved' : 'pending',
          legacy_file_path: clip.clip || null,
          migrated_at: new Date().toISOString(),
          created_at: clip.date_added
            ? new Date(clip.date_added * 1000).toISOString()
            : new Date().toISOString(),
        };
      })
      .filter(v => v !== null);

    if (toInsert.length > 0) {
      const { error } = await supabase
        .from('videos')
        .upsert(toInsert, { onConflict: 'legacy_clip_id' });

      if (error) {
        console.error(`   ❌ Батч ${i}: ${error.message}`);
        failed += toInsert.length;
      } else {
        imported += toInsert.length;
      }
    }
  }

  console.log(`\n   ✅ Импортировано: ${imported}`);
  console.log(`   ⏭️ Пропущено: ${skipped}`);
  console.log(`   ❌ Ошибок: ${failed}`);
}

// ============================================
// ГЛАВНАЯ ФУНКЦИЯ
// ============================================

async function main() {
  console.log('🚀 МИГРАЦИЯ promo.fm -> PROMO.MUSIC\n');
  console.log('='.repeat(60));

  // Проверка конфига
  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_KEY не указан в .env');
    return;
  }

  console.log(`\n📡 Supabase: ${SUPABASE_URL}`);

  // Читаем SQL
  const sqlPath = path.join(__dirname, 'data_export.sql');
  console.log(`📂 Читаю: ${sqlPath}`);

  const sql = fs.readFileSync(sqlPath, 'utf-8');
  console.log(`   Размер: ${(sql.length / 1024 / 1024).toFixed(2)} MB`);

  // Парсим данные
  console.log('\n📊 Парсинг данных...');

  const users = parseAllInserts(sql, 'users');
  console.log(`   users: ${users.length}`);

  const tracks = parseAllInserts(sql, 'tracks');
  console.log(`   tracks: ${tracks.length}`);

  const clips = parseAllInserts(sql, 'clips');
  console.log(`   clips: ${clips.length}`);

  // Создаём таблицы
  await setupTables();

  // Импорт
  console.log('\n' + '='.repeat(60));
  console.log('📥 ИМПОРТ ДАННЫХ');

  const artistMap = await importUsers(users);
  await importTracks(tracks, artistMap);
  await importVideos(clips, artistMap);

  // Обновляем счётчики
  console.log('\n📊 Обновление счётчиков...');

  await supabase.rpc('update_artist_counts');

  // Итог
  console.log('\n' + '='.repeat(60));
  console.log('✅ МИГРАЦИЯ ЗАВЕРШЕНА\n');

  // Сохраняем маппинг
  const mappingData = Object.fromEntries(artistMap);
  const mappingPath = path.join(__dirname, `artist_mapping_${Date.now()}.json`);
  fs.writeFileSync(mappingPath, JSON.stringify(mappingData, null, 2));
  console.log(`📁 Маппинг сохранён: ${mappingPath}`);
}

main().catch(console.error);
