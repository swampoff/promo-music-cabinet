/**
 * Миграция promo.fm -> PROMO.MUSIC v3
 * Минимальная версия - использует только существующие колонки
 *
 * Запуск: npx tsx migrate-v3.ts
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
// ОПРЕДЕЛЕНИЕ КОЛОНОК
// ============================================

async function getTableColumns(tableName: string): Promise<string[]> {
  // Пробуем вставить пустую запись чтобы получить ошибку с колонками
  // Или делаем тестовый select
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(0);

  // Пробуем вставить минимальную запись
  const testInsert: any = { id: '00000000-0000-0000-0000-000000000000' };

  const { error: insertError } = await supabase
    .from(tableName)
    .insert(testInsert)
    .select();

  if (insertError) {
    // Парсим ошибку чтобы понять какие поля нужны
    console.log(`   ${tableName} insert error: ${insertError.message}`);
  }

  // Возвращаем пустой массив - колонки определим по ходу
  return [];
}

// ============================================
// ИМПОРТ АРТИСТОВ
// ============================================

async function importArtists(users: any[]): Promise<Map<number, string>> {
  console.log('\n👥 Импорт артистов...\n');

  const artistMap = new Map<number, string>();

  // Фильтруем артистов
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
  let failed = 0;

  for (let i = 0; i < uniqueArtists.length; i++) {
    const artist = uniqueArtists[i];
    const email = artist.email.toLowerCase().trim();

    try {
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
          // Пробуем найти по email
          const { data: { users: allUsers } } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 1000
          });

          const existingUser = allUsers?.find(u => u.email?.toLowerCase() === email);

          if (!existingUser) {
            // Ищем по всем страницам
            let found = false;
            for (let page = 2; page <= 10 && !found; page++) {
              const { data: { users: moreUsers } } = await supabase.auth.admin.listUsers({
                page,
                perPage: 1000
              });

              if (!moreUsers || moreUsers.length === 0) break;

              const foundUser = moreUsers.find(u => u.email?.toLowerCase() === email);
              if (foundUser) {
                userId = foundUser.id;
                found = true;
              }
            }

            if (!found) {
              failed++;
              continue;
            }
          } else {
            userId = existingUser.id;
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

      // Минимальные данные для вставки
      const artistData: any = {
        user_id: userId,
        display_name: artist.ProfileArtistName || `Артист #${artist.id}`,
      };

      // Пробуем добавить дополнительные поля
      if (artist.ProfileArtistAbout) artistData.bio = artist.ProfileArtistAbout;
      if (Object.keys(socialLinks).length > 0) artistData.social_links = socialLinks;
      if (artist.ProfileArtistStyle) artistData.genres = [artist.ProfileArtistStyle];

      const { data: profile, error: profileError } = await supabase
        .from('artists')
        .insert(artistData)
        .select('id')
        .single();

      if (profileError) {
        // Если ошибка, пробуем с меньшим набором полей
        const minData = {
          user_id: userId,
          display_name: artist.ProfileArtistName || `Артист #${artist.id}`,
        };

        const { data: profile2, error: error2 } = await supabase
          .from('artists')
          .insert(minData)
          .select('id')
          .single();

        if (error2) {
          console.error(`   ❌ ${email}: ${error2.message}`);
          failed++;
          continue;
        }

        artistMap.set(artist.id, profile2.id);
        created++;
      } else {
        artistMap.set(artist.id, profile.id);
        created++;
      }

      if (created % 100 === 0) {
        console.log(`   Прогресс: ${created}/${uniqueArtists.length}`);
      }
    } catch (err: any) {
      failed++;
    }
  }

  console.log(`\n   ✅ Создано: ${created}`);
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
          title: track.songname || `Трек #${track.id}`,
          description: track.information || null,
          genre: track.song_style || null,
          duration: (track.songtime_m || 0) * 60 + (track.songtime_s || 0),
          audio_url: track.file_uploaded
            ? `legacy/${track.file_uploaded}`
            : 'pending',
          status: track.status === 1 ? 'published' : 'draft',
        };
      })
      .filter(t => t !== null);

    if (toInsert.length > 0) {
      const { error } = await supabase.from('tracks').insert(toInsert);

      if (error) {
        // Пробуем с минимальными полями
        const minData = toInsert.map((t: any) => ({
          artist_id: t.artist_id,
          title: t.title,
          duration: t.duration || 0,
          audio_url: t.audio_url || 'pending',
        }));

        const { error: error2 } = await supabase.from('tracks').insert(minData);
        if (error2) {
          console.error(`   ❌ Батч ${i}: ${error2.message}`);
          failed += toInsert.length;
        } else {
          imported += toInsert.length;
        }
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
          title: clip.songname || `Видео #${clip.id}`,
          description: clip.information || null,
          youtube_url: youtubeUrl,
          video_url: youtubeUrl || 'pending',
          duration: (clip.songtime_m || 0) * 60 + (clip.songtime_s || 0),
          status: clip.status === 1 ? 'published' : 'draft',
        };
      })
      .filter(v => v !== null);

    if (toInsert.length > 0) {
      const { error } = await supabase.from('videos').insert(toInsert);

      if (error) {
        // Минимальные поля
        const minData = toInsert.map((v: any) => ({
          artist_id: v.artist_id,
          title: v.title,
          video_url: v.video_url || 'pending',
          duration: v.duration || 0,
        }));

        const { error: error2 } = await supabase.from('videos').insert(minData);
        if (error2) {
          console.error(`   ❌ Батч ${i}: ${error2.message}`);
          failed += toInsert.length;
        } else {
          imported += toInsert.length;
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
  console.log('🚀 МИГРАЦИЯ promo.fm -> PROMO.MUSIC (v3)\n');
  console.log('='.repeat(60));

  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_KEY не указан');
    return;
  }

  // Проверяем подключение
  const { error: testError } = await supabase.from('artists').select('id').limit(1);
  if (testError) {
    console.error(`❌ Ошибка подключения: ${testError.message}`);
    return;
  }
  console.log('✅ Подключение к Supabase OK');

  // Читаем SQL
  const sqlPath = path.join(__dirname, 'data_export.sql');
  console.log(`\n📂 Читаю: ${sqlPath}`);

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
