/**
 * Миграция promo.fm -> PROMO.MUSIC v2
 * Работает с существующими таблицами: artists, tracks, videos
 *
 * Запуск: npx tsx migrate-v2.ts
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
// ИМПОРТ В СУЩЕСТВУЮЩИЕ ТАБЛИЦЫ
// ============================================

async function importArtists(users: any[]): Promise<Map<number, string>> {
  console.log('\n👥 Импорт артистов в таблицу "artists"...\n');

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
      // Проверим, есть ли уже артист с этим legacy_user_id
      const { data: existingArtist } = await supabase
        .from('artists')
        .select('id')
        .eq('legacy_user_id', artist.id)
        .single();

      if (existingArtist) {
        artistMap.set(artist.id, existingArtist.id);
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
          // Пользователь уже существует
          const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers();
          const existingUser = existingUsers?.find(u => u.email === email);
          if (existingUser) {
            userId = existingUser.id;
          } else {
            console.error(`   ❌ ${email}: не найден`);
            failed++;
            continue;
          }
        } else {
          console.error(`   ❌ ${email}: ${authError.message}`);
          failed++;
          continue;
        }
      } else {
        userId = authData.user.id;
      }

      // Собираем social_links
      const socialLinks: Record<string, string> = {};
      if (artist.ProfileVkontakte) socialLinks.vk = artist.ProfileVkontakte;
      if (artist.ProfileFacebook) socialLinks.facebook = artist.ProfileFacebook;
      if (artist.Profileinst) socialLinks.instagram = artist.Profileinst;
      if (artist.ProfileTwitter) socialLinks.twitter = artist.ProfileTwitter;
      if (artist.ProfileTiktok) socialLinks.tiktok = artist.ProfileTiktok;
      if (artist.ProfileSite) socialLinks.website = artist.ProfileSite;

      // Вставляем в artists (используем существующую схему)
      const artistData: any = {
        user_id: userId,
        display_name: artist.ProfileArtistName || `Артист #${artist.id}`,
        bio: artist.ProfileArtistAbout || null,
        city: artist.ProfileCity || null,
        country: 'Россия',
        genres: artist.ProfileArtistStyle ? [artist.ProfileArtistStyle] : [],
        social_links: Object.keys(socialLinks).length > 0 ? socialLinks : {},
        status: 'active',
      };

      // Добавляем legacy_user_id если колонка существует
      artistData.legacy_user_id = artist.id;

      const { data: profile, error: profileError } = await supabase
        .from('artists')
        .insert(artistData)
        .select('id')
        .single();

      if (profileError) {
        // Если ошибка из-за отсутствия колонки, пробуем без неё
        if (profileError.message.includes('legacy_user_id')) {
          delete artistData.legacy_user_id;
          const { data: profile2, error: profileError2 } = await supabase
            .from('artists')
            .insert(artistData)
            .select('id')
            .single();

          if (profileError2) {
            console.error(`   ❌ ${email}: ${profileError2.message}`);
            failed++;
            continue;
          }
          artistMap.set(artist.id, profile2.id);
          created++;
        } else {
          console.error(`   ❌ ${email}: ${profileError.message}`);
          failed++;
          continue;
        }
      } else {
        artistMap.set(artist.id, profile.id);
        created++;
      }

      if ((created + existing) % 100 === 0) {
        console.log(`   Прогресс: ${created + existing}/${uniqueArtists.length}`);
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

        const trackData: any = {
          artist_id: artistId,
          title: track.songname || `Трек #${track.id}`,
          description: track.information || null,
          genre: track.song_style || null,
          duration: (track.songtime_m || 0) * 60 + (track.songtime_s || 0),
          status: track.archive === 1 ? 'archived' : statusInfo.status,
          plays: 0,
          likes: 0,
        };

        // Добавляем legacy поля если они есть в схеме
        trackData.legacy_track_id = track.id;
        trackData.audio_url = track.file_uploaded
          ? `legacy/tracks/${track.user_id}/${track.file_uploaded}`
          : 'pending';

        return trackData;
      })
      .filter(t => t !== null);

    if (toInsert.length > 0) {
      // Пробуем вставить
      const { error } = await supabase.from('tracks').insert(toInsert);

      if (error) {
        // Если ошибка из-за колонки, пробуем без неё
        if (error.message.includes('legacy_track_id')) {
          const cleanData = toInsert.map((t: any) => {
            const { legacy_track_id, ...rest } = t;
            return rest;
          });
          const { error: error2 } = await supabase.from('tracks').insert(cleanData);
          if (error2) {
            console.error(`   ❌ Батч ${i}: ${error2.message}`);
            failed += toInsert.length;
          } else {
            imported += toInsert.length;
          }
        } else {
          console.error(`   ❌ Батч ${i}: ${error.message}`);
          failed += toInsert.length;
        }
      } else {
        imported += toInsert.length;
      }
    }

    if ((i + batchSize) % 500 === 0 || i + batchSize >= tracks.length) {
      console.log(`   Прогресс: ${Math.min(i + batchSize, tracks.length)}/${tracks.length}`);
    }
  }

  console.log(`\n   ✅ Импортировано: ${imported}`);
  console.log(`   ⏭️ Пропущено: ${skipped}`);
  console.log(`   ❌ Ошибок: ${failed}`);
}

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
          title: clip.songname || `Видео #${clip.id}`,
          description: clip.information || null,
          youtube_url: youtubeUrl,
          status: clip.status === 1 ? 'published' : 'draft',
          views: 0,
          likes: 0,
          legacy_clip_id: clip.id,
        };
      })
      .filter(v => v !== null);

    if (toInsert.length > 0) {
      const { error } = await supabase.from('videos').insert(toInsert);

      if (error) {
        if (error.message.includes('legacy_clip_id')) {
          const cleanData = toInsert.map((v: any) => {
            const { legacy_clip_id, ...rest } = v;
            return rest;
          });
          const { error: error2 } = await supabase.from('videos').insert(cleanData);
          if (error2) {
            console.error(`   ❌ Батч ${i}: ${error2.message}`);
            failed += toInsert.length;
          } else {
            imported += toInsert.length;
          }
        } else {
          console.error(`   ❌ Батч ${i}: ${error.message}`);
          failed += toInsert.length;
        }
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
  console.log('🚀 МИГРАЦИЯ promo.fm -> PROMO.MUSIC (v2)\n');
  console.log('='.repeat(60));

  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_KEY не указан в .env');
    return;
  }

  console.log(`\n📡 Supabase: ${SUPABASE_URL}`);

  // Проверяем подключение
  const { data: testData, error: testError } = await supabase
    .from('artists')
    .select('id')
    .limit(1);

  if (testError) {
    console.error(`❌ Ошибка подключения: ${testError.message}`);
    return;
  }
  console.log('✅ Подключение к Supabase успешно');

  // Читаем SQL
  const sqlPath = path.join(__dirname, 'data_export.sql');
  console.log(`\n📂 Читаю: ${sqlPath}`);

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

  // Импорт
  console.log('\n' + '='.repeat(60));
  console.log('📥 ИМПОРТ ДАННЫХ');

  const artistMap = await importArtists(users);
  await importTracks(tracks, artistMap);
  await importVideos(clips, artistMap);

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
