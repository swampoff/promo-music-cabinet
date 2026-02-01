/**
 * Парсинг SQL экспорта и импорт в Supabase
 *
 * Запуск: npx tsx parse-and-import.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ============================================
// КОНФИГУРАЦИЯ
// ============================================

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qzpmiiqfwkcnrhvubdgt.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// ============================================
// ТИПЫ
// ============================================

interface OldUser {
  id: number;
  email: string;
  password: string;
  password2: string;
  group: number;
  ProfileArtistName: string;
  ProfileArtistAbout: string;
  ProfileArtistStyle: string;
  ProfileCity: string;
  ProfileCountry: string;
  ProfileVkontakte: string;
  ProfileFacebook: string;
  Profileinst: string;
  ProfileSpotify: string;
  reg_date: number;
  [key: string]: any;
}

interface OldTrack {
  id: number;
  user_id: number;
  songname: string;
  information: string;
  file_uploaded: string;
  songtime_m: number;
  songtime_s: number;
  song_style: string;
  status: number;
  date_added: number;
  [key: string]: any;
}

interface OldClip {
  id: number;
  user_id: number;
  songname: string;
  embed: string;
  director: string;
  status: number;
  [key: string]: any;
}

// ============================================
// ПАРСЕР SQL
// ============================================

function parseInsertStatements(sql: string, tableName: string): any[] {
  const results: any[] = [];

  // Найти начало INSERT для нужной таблицы
  const insertRegex = new RegExp(`INSERT INTO \`${tableName}\` \\([^)]+\\) VALUES`, 'g');
  const matches = sql.match(insertRegex);

  if (!matches) return results;

  // Получить названия колонок
  const columnsMatch = sql.match(new RegExp(`INSERT INTO \`${tableName}\` \\(([^)]+)\\) VALUES`));
  if (!columnsMatch) return results;

  const columns = columnsMatch[1]
    .split(',')
    .map(c => c.replace(/`/g, '').trim());

  // Найти все VALUES для этой таблицы
  const tableSection = sql.substring(
    sql.indexOf(`INSERT INTO \`${tableName}\``),
    sql.indexOf(`INSERT INTO`, sql.indexOf(`INSERT INTO \`${tableName}\``) + 1) || sql.length
  );

  // Парсим значения
  const valueRegex = /\(([^)]+(?:\([^)]*\)[^)]*)*)\)/g;
  let match;
  let afterValues = tableSection.substring(tableSection.indexOf('VALUES') + 6);

  // Разделяем по ),\n(
  const rows = afterValues.split(/\),\s*\n?\(/);

  for (let row of rows) {
    // Очищаем строку
    row = row.replace(/^\s*\(/, '').replace(/\);\s*$/, '').replace(/\)\s*$/, '');

    if (!row.trim()) continue;

    try {
      const values = parseRowValues(row);

      if (values.length === columns.length) {
        const obj: any = {};
        columns.forEach((col, i) => {
          obj[col] = values[i];
        });
        results.push(obj);
      }
    } catch (e) {
      // Пропускаем проблемные строки
    }
  }

  return results;
}

function parseRowValues(row: string): any[] {
  const values: any[] = [];
  let current = '';
  let inString = false;
  let stringChar = '';
  let depth = 0;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const prevChar = row[i - 1];

    if (!inString && (char === "'" || char === '"')) {
      inString = true;
      stringChar = char;
      current += char;
    } else if (inString && char === stringChar && prevChar !== '\\') {
      inString = false;
      current += char;
    } else if (!inString && char === '(') {
      depth++;
      current += char;
    } else if (!inString && char === ')') {
      depth--;
      current += char;
    } else if (!inString && depth === 0 && char === ',') {
      values.push(parseValue(current.trim()));
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    values.push(parseValue(current.trim()));
  }

  return values;
}

function parseValue(val: string): any {
  if (val === 'NULL' || val === 'null') return null;
  if (val === "''") return '';

  // Число
  if (/^-?\d+$/.test(val)) return parseInt(val);
  if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val);

  // Строка
  if ((val.startsWith("'") && val.endsWith("'")) ||
      (val.startsWith('"') && val.endsWith('"'))) {
    return val.slice(1, -1)
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
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
// ТРАНСФОРМАЦИЯ ДАННЫХ
// ============================================

function transformUser(old: OldUser) {
  return {
    legacy_user_id: old.id,
    email: old.email?.toLowerCase().trim(),
    display_name: old.ProfileArtistName || `Артист #${old.id}`,
    bio: old.ProfileArtistAbout || null,
    artist_type: old.group === 1 ? 'solo' : old.group === 2 ? 'band' : 'solo',
    city: old.ProfileCity || null,
    country: getCountryName(old.ProfileCountry),
    genres: old.ProfileArtistStyle ? [normalizeGenre(old.ProfileArtistStyle)] : [],
    social_links: cleanObject({
      vk: old.ProfileVkontakte,
      facebook: old.ProfileFacebook,
      instagram: old.Profileinst,
      twitter: old.ProfileTwitter,
      tiktok: old.ProfileTiktok,
    }),
    streaming_links: cleanObject({
      spotify: old.ProfileSpotify,
      apple_music: old.ProfileMusic,
    }),
    contact_email: old.ProfileEmail || null,
    contact_phone: old.ProfilePhone || null,
    created_at: old.reg_date ? new Date(old.reg_date * 1000).toISOString() : new Date().toISOString(),
    is_artist: old.group === 1 || old.group === 2,
  };
}

function transformTrack(old: OldTrack, artistMap: Map<number, string>) {
  const artistId = artistMap.get(old.user_id);
  if (!artistId) return null;

  return {
    legacy_track_id: old.id,
    artist_id: artistId,
    title: old.songname || `Трек #${old.id}`,
    description: old.information || null,
    genre: normalizeGenre(old.song_style),
    duration: (old.songtime_m || 0) * 60 + (old.songtime_s || 0),
    status: old.archive === 1 ? 'archived' : old.status === 1 ? 'published' : 'draft',
    moderation_status: old.status === 0 ? 'pending' : old.status === 1 ? 'approved' : old.status === 2 ? 'rejected' : 'draft',
    legacy_file_path: old.file_uploaded || null,
    audio_url: old.file_uploaded ? `legacy/tracks/${old.user_id}/${old.file_uploaded}` : null,
    created_at: old.date_added ? new Date(old.date_added * 1000).toISOString() : new Date().toISOString(),
  };
}

function transformClip(old: OldClip, artistMap: Map<number, string>) {
  const artistId = artistMap.get(old.user_id);
  if (!artistId) return null;

  // Извлекаем YouTube URL из embed
  let youtubeUrl = null;
  if (old.embed) {
    const match = old.embed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/i);
    if (match) {
      youtubeUrl = `https://www.youtube.com/watch?v=${match[1]}`;
    }
  }

  return {
    legacy_clip_id: old.id,
    artist_id: artistId,
    title: old.songname || `Видео #${old.id}`,
    description: old.information || null,
    youtube_url: youtubeUrl,
    external_embed: old.embed || null,
    video_type: 'music_video',
    status: old.status === 1 ? 'published' : 'draft',
    moderation_status: old.status === 1 ? 'approved' : 'pending',
    credits: old.director ? { director: old.director } : {},
    created_at: old.date_added ? new Date(old.date_added * 1000).toISOString() : new Date().toISOString(),
  };
}

// ============================================
// УТИЛИТЫ
// ============================================

function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    '1': 'Россия', '2': 'Украина', '3': 'Беларусь', '4': 'Казахстан',
    'rus': 'Россия', 'ua': 'Украина', 'by': 'Беларусь',
  };
  return countries[code?.toLowerCase()] || 'Россия';
}

function normalizeGenre(genre: string): string {
  if (!genre) return 'Other';
  const map: Record<string, string> = {
    'поп': 'Pop', 'pop': 'Pop',
    'рок': 'Rock', 'rock': 'Rock', 'поп-рок': 'Pop Rock',
    'dance': 'Dance', 'дэнс': 'Dance',
    'хип-хоп': 'Hip-Hop', 'рэп': 'Hip-Hop',
    'шансон': 'Chanson',
    'джаз': 'Jazz', 'jazz': 'Jazz',
    'r&b': 'R&B', 'rnb': 'R&B',
  };
  return map[genre.toLowerCase().trim()] || genre.trim();
}

function cleanObject(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value && value.trim && value.trim() !== '') {
      result[key] = value.trim();
    }
  }
  return result;
}

function generatePassword(): string {
  return Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2);
}

// ============================================
// ИМПОРТ В SUPABASE
// ============================================

async function importUsers(users: any[]): Promise<Map<number, string>> {
  const artistMap = new Map<number, string>();
  const artists = users.filter(u => u.is_artist && u.email);

  console.log(`\n👥 Импорт ${artists.length} артистов...`);

  // Убираем дубликаты email
  const seenEmails = new Set<string>();
  const uniqueArtists = artists.filter(a => {
    if (!a.email || seenEmails.has(a.email)) return false;
    seenEmails.add(a.email);
    return true;
  });

  console.log(`   Уникальных: ${uniqueArtists.length}`);

  let created = 0;
  let failed = 0;

  for (const artist of uniqueArtists) {
    try {
      // Создаём пользователя в Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: artist.email,
        password: generatePassword(),
        email_confirm: true,
        user_metadata: {
          legacy_user_id: artist.legacy_user_id,
          display_name: artist.display_name,
        },
      });

      if (authError) {
        // Пробуем найти существующего
        if (authError.message.includes('already')) {
          const { data: users } = await supabase.auth.admin.listUsers();
          const existing = users?.users.find(u => u.email === artist.email);
          if (existing) {
            artistMap.set(artist.legacy_user_id, existing.id);
          }
        }
        failed++;
        continue;
      }

      const userId = authData.user.id;

      // Создаём профиль артиста
      const { data: profile, error: profileError } = await supabase
        .from('artist_profiles')
        .insert({
          user_id: userId,
          legacy_user_id: artist.legacy_user_id,
          display_name: artist.display_name,
          bio: artist.bio,
          artist_type: artist.artist_type,
          city: artist.city,
          country: artist.country,
          genres: artist.genres,
          social_links: artist.social_links,
          streaming_links: artist.streaming_links,
          contact_email: artist.contact_email,
          contact_phone: artist.contact_phone,
          status: 'active',
          migrated_at: new Date().toISOString(),
          created_at: artist.created_at,
        })
        .select('id')
        .single();

      if (profileError) {
        console.error(`   ❌ Профиль для ${artist.email}: ${profileError.message}`);
        failed++;
        continue;
      }

      artistMap.set(artist.legacy_user_id, profile.id);
      created++;

      if (created % 100 === 0) {
        console.log(`   Создано: ${created}...`);
      }
    } catch (err) {
      failed++;
    }
  }

  console.log(`   ✅ Создано: ${created}, ошибок: ${failed}`);
  return artistMap;
}

async function importTracks(tracks: any[], artistMap: Map<number, string>): Promise<void> {
  console.log(`\n🎵 Импорт ${tracks.length} треков...`);

  const transformed = tracks
    .map(t => transformTrack(t, artistMap))
    .filter(t => t !== null);

  console.log(`   С артистами: ${transformed.length}`);

  // Импортируем батчами
  const batchSize = 100;
  let imported = 0;

  for (let i = 0; i < transformed.length; i += batchSize) {
    const batch = transformed.slice(i, i + batchSize);

    const { error } = await supabase
      .from('tracks')
      .insert(batch);

    if (error) {
      console.error(`   ❌ Батч ${i}: ${error.message}`);
    } else {
      imported += batch.length;
    }

    if (imported % 500 === 0) {
      console.log(`   Импортировано: ${imported}...`);
    }
  }

  console.log(`   ✅ Импортировано: ${imported}`);
}

async function importVideos(clips: any[], artistMap: Map<number, string>): Promise<void> {
  console.log(`\n🎬 Импорт ${clips.length} видео...`);

  const transformed = clips
    .map(c => transformClip(c, artistMap))
    .filter(c => c !== null);

  console.log(`   С артистами: ${transformed.length}`);

  const batchSize = 50;
  let imported = 0;

  for (let i = 0; i < transformed.length; i += batchSize) {
    const batch = transformed.slice(i, i + batchSize);

    const { error } = await supabase
      .from('videos')
      .insert(batch);

    if (error) {
      console.error(`   ❌ Батч ${i}: ${error.message}`);
    } else {
      imported += batch.length;
    }
  }

  console.log(`   ✅ Импортировано: ${imported}`);
}

// ============================================
// ГЛАВНАЯ ФУНКЦИЯ
// ============================================

async function main() {
  console.log('🚀 Миграция promo.fm -> PROMO.MUSIC\n');
  console.log('='.repeat(50));

  // Проверка конфигурации
  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ Не указан SUPABASE_SERVICE_KEY');
    console.log('   Добавьте его в .env файл');
    return;
  }

  // Читаем SQL файл
  const sqlPath = path.join(__dirname, 'data_export.sql');
  console.log(`\n📂 Читаю ${sqlPath}...`);

  const sql = fs.readFileSync(sqlPath, 'utf-8');
  console.log(`   Размер: ${(sql.length / 1024 / 1024).toFixed(2)} MB`);

  // Парсим данные
  console.log('\n📊 Парсинг данных...');

  const users = parseInsertStatements(sql, 'users');
  console.log(`   users: ${users.length}`);

  const tracks = parseInsertStatements(sql, 'tracks');
  console.log(`   tracks: ${tracks.length}`);

  const clips = parseInsertStatements(sql, 'clips');
  console.log(`   clips: ${clips.length}`);

  // Трансформируем пользователей
  const transformedUsers = users.map(transformUser);
  const artistsCount = transformedUsers.filter(u => u.is_artist).length;
  console.log(`   Артистов: ${artistsCount}`);

  // Импорт
  console.log('\n' + '='.repeat(50));
  console.log('📥 ИМПОРТ В SUPABASE\n');

  // 1. Импорт пользователей и создание профилей
  const artistMap = await importUsers(transformedUsers);

  // 2. Импорт треков
  await importTracks(tracks, artistMap);

  // 3. Импорт видео
  await importVideos(clips, artistMap);

  // Итог
  console.log('\n' + '='.repeat(50));
  console.log('✅ МИГРАЦИЯ ЗАВЕРШЕНА\n');
  console.log(`   Артистов: ${artistMap.size}`);

  // Сохраняем маппинг
  const mappingPath = path.join(__dirname, `mapping_${Date.now()}.json`);
  fs.writeFileSync(mappingPath, JSON.stringify(
    Object.fromEntries(artistMap),
    null,
    2
  ));
  console.log(`   Маппинг сохранён: ${mappingPath}`);
}

main().catch(console.error);
