/**
 * Миграция promo.fm -> PROMO.MUSIC (финальная версия)
 * Использует реальную схему таблиц
 *
 * Таблица artists:
 *   - id, email, username, full_name
 *   - coins_balance, total_coins_spent, total_coins_earned
 *   - total_plays, total_followers, total_concerts
 *   - created_at, updated_at
 *
 * Запуск: npx tsx migrate-final.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config as dotenvConfig } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// ============================================
// ПАРСЕР SQL
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

    if (!inString && (char === "'" || char === '"') && prev !== '\\') {
      inString = true;
      stringChar = char;
      current += char;
    } else if (inString && char === stringChar && prev !== '\\') {
      inString = false;
      current += char;
    } else if (!inString && char === '(') {
      if (depth === 0) current = '';
      else current += char;
      depth++;
    } else if (!inString && char === ')') {
      depth--;
      if (depth === 0) {
        if (current.trim()) rows.push(current);
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
      .replace(/&amp;/g, '&');
  }

  return val;
}

// ============================================
// ИМПОРТ АРТИСТОВ
// ============================================

async function importArtists(users: any[]): Promise<Map<number, string>> {
  console.log('\n👥 Импорт артистов...\n');

  const artistMap = new Map<number, string>();

  // Фильтруем артистов (группы 1 и 2 с email)
  const artists = users.filter(u =>
    (u.group === 1 || u.group === 2) &&
    u.email &&
    u.email.includes('@')
  );

  // Убираем дубликаты email
  const seenEmails = new Set<string>();
  const uniqueArtists = artists.filter(a => {
    const email = a.email.toLowerCase().trim();
    if (seenEmails.has(email)) return false;
    seenEmails.add(email);
    return true;
  });

  console.log(`   Всего: ${artists.length}, уникальных: ${uniqueArtists.length}`);

  let created = 0;
  let existing = 0;
  let failed = 0;

  // Получаем существующих артистов
  const { data: existingArtists } = await supabase
    .from('artists')
    .select('id, email');

  const existingEmails = new Set(existingArtists?.map(a => a.email?.toLowerCase()) || []);

  for (let i = 0; i < uniqueArtists.length; i++) {
    const artist = uniqueArtists[i];
    const email = artist.email.toLowerCase().trim();

    // Пропускаем если уже есть
    if (existingEmails.has(email)) {
      const existingArtist = existingArtists?.find(a => a.email?.toLowerCase() === email);
      if (existingArtist) {
        artistMap.set(artist.id, existingArtist.id);
        existing++;
      }
      continue;
    }

    try {
      // Генерируем username из email или имени
      const username = artist.ProfileArtistName
        ? artist.ProfileArtistName.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '_').slice(0, 30)
        : email.split('@')[0].slice(0, 30);

      // Данные для вставки (реальная схема artists)
      const artistData = {
        email: email,
        username: `${username}_${artist.id}`, // уникальный username
        full_name: artist.ProfileArtistName || `Артист #${artist.id}`,
        coins_balance: 0,
        total_coins_spent: 0,
        total_coins_earned: 0,
        total_plays: 0,
        total_followers: 0,
        total_concerts: 0,
      };

      const { data: newArtist, error } = await supabase
        .from('artists')
        .insert(artistData)
        .select('id')
        .single();

      if (error) {
        if (error.message.includes('duplicate')) {
          // Уже есть - пропускаем
          existing++;
        } else {
          console.error(`   ❌ ${email}: ${error.message}`);
          failed++;
        }
        continue;
      }

      artistMap.set(artist.id, newArtist.id);
      created++;

      if (created % 100 === 0) {
        console.log(`   Прогресс: ${created}/${uniqueArtists.length}`);
      }
    } catch (err: any) {
      console.error(`   ❌ ${email}: ${err.message}`);
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

  let imported = 0;
  let skipped = 0;
  let failed = 0;

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

        return {
          artist_id: artistId,
          title: (track.songname || `Трек #${track.id}`).slice(0, 255),
          description: track.information || null,
          genre: track.song_style || null,
          duration: (track.songtime_m || 0) * 60 + (track.songtime_s || 0),
          audio_url: track.file_uploaded
            ? `legacy/${track.file_uploaded}`
            : 'pending',
          status: track.status === 1 ? 'published' : 'draft',
          plays: 0,
          likes: 0,
        };
      })
      .filter(t => t !== null);

    if (toInsert.length > 0) {
      const { error } = await supabase.from('tracks').insert(toInsert);

      if (error) {
        console.error(`   ❌ Батч ${i}: ${error.message}`);
        failed += toInsert.length;
      } else {
        imported += toInsert.length;
      }
    }

    if ((i + batchSize) % 500 === 0) {
      console.log(`   Прогресс: ${Math.min(i + batchSize, tracks.length)}/${tracks.length}`);
    }
  }

  console.log(`\n   ✅ Импортировано: ${imported}`);
  console.log(`   ⏭️ Пропущено: ${skipped}`);
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

        let youtubeUrl = null;
        if (clip.embed) {
          const match = clip.embed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/i);
          if (match) {
            youtubeUrl = `https://www.youtube.com/watch?v=${match[1]}`;
          }
        }

        return {
          artist_id: artistId,
          title: (clip.songname || `Видео #${clip.id}`).slice(0, 255),
          description: clip.information || null,
          youtube_url: youtubeUrl,
          video_url: youtubeUrl || 'pending',
          duration: (clip.songtime_m || 0) * 60 + (clip.songtime_s || 0),
          status: clip.status === 1 ? 'published' : 'draft',
          views: 0,
          likes: 0,
        };
      })
      .filter(v => v !== null);

    if (toInsert.length > 0) {
      const { error } = await supabase.from('videos').insert(toInsert);

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
// MAIN
// ============================================

async function main() {
  console.log('🚀 МИГРАЦИЯ promo.fm -> PROMO.MUSIC\n');
  console.log('='.repeat(60));

  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_KEY не указан');
    return;
  }

  // Проверяем подключение
  const { data, error: testError } = await supabase.from('artists').select('id').limit(1);
  if (testError) {
    console.error(`❌ Ошибка подключения: ${testError.message}`);
    return;
  }
  console.log('✅ Подключение к Supabase OK');

  // Читаем SQL
  const sqlPath = path.join(__dirname, 'data_export.sql');
  console.log(`\n📂 Файл: ${sqlPath}`);

  const sql = fs.readFileSync(sqlPath, 'utf-8');
  console.log(`   Размер: ${(sql.length / 1024 / 1024).toFixed(2)} MB`);

  // Парсим данные
  console.log('\n📊 Парсинг...');

  const users = parseAllInserts(sql, 'users');
  console.log(`   users: ${users.length}`);

  const tracks = parseAllInserts(sql, 'tracks');
  console.log(`   tracks: ${tracks.length}`);

  const clips = parseAllInserts(sql, 'clips');
  console.log(`   clips: ${clips.length}`);

  // Импорт
  console.log('\n' + '='.repeat(60));

  const artistMap = await importArtists(users);
  await importTracks(tracks, artistMap);
  await importVideos(clips, artistMap);

  // Сохраняем маппинг
  const mappingPath = path.join(__dirname, `mapping_${Date.now()}.json`);
  fs.writeFileSync(mappingPath, JSON.stringify(Object.fromEntries(artistMap), null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('✅ МИГРАЦИЯ ЗАВЕРШЕНА');
  console.log(`📁 Маппинг: ${mappingPath}`);
}

main().catch(console.error);
