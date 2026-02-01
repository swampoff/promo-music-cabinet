/**
 * Импорт треков и видео (исправленная версия)
 *
 * Колонки:
 *   tracks: plays_count, likes_count, shares_count
 *   videos: views_count, likes_count, shares_count
 *
 * Запуск: npx tsx import-tracks-videos.ts
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
// ЗАГРУЗКА МАППИНГА
// ============================================

async function loadArtistMap(): Promise<Map<number, string>> {
  // Найти последний файл маппинга
  const files = fs.readdirSync(__dirname).filter(f => f.startsWith('mapping_') && f.endsWith('.json'));
  if (files.length === 0) {
    throw new Error('Не найден файл маппинга. Сначала запустите migrate-final.ts');
  }

  const latestFile = files.sort().pop()!;
  console.log(`📂 Загружаю маппинг: ${latestFile}`);

  const data = JSON.parse(fs.readFileSync(path.join(__dirname, latestFile), 'utf-8'));
  const map = new Map<number, string>();

  for (const [legacyId, newId] of Object.entries(data)) {
    map.set(parseInt(legacyId), newId as string);
  }

  console.log(`   Загружено: ${map.size} артистов`);
  return map;
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

        // Используем правильные имена колонок!
        return {
          artist_id: artistId,
          title: (track.songname || `Трек #${track.id}`).slice(0, 255),
          // НЕ включаем: likes, plays - они называются likes_count, plays_count
          // и имеют default значения
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

        // Минимальные поля
        return {
          artist_id: artistId,
          title: (clip.songname || `Видео #${clip.id}`).slice(0, 255),
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
  console.log('🚀 ИМПОРТ ТРЕКОВ И ВИДЕО\n');
  console.log('='.repeat(60));

  // Загружаем маппинг артистов
  const artistMap = await loadArtistMap();

  // Читаем SQL
  const sqlPath = path.join(__dirname, 'data_export.sql');
  console.log(`\n📂 Файл: ${sqlPath}`);

  const sql = fs.readFileSync(sqlPath, 'utf-8');

  // Парсим данные
  console.log('\n📊 Парсинг...');

  const tracks = parseAllInserts(sql, 'tracks');
  console.log(`   tracks: ${tracks.length}`);

  const clips = parseAllInserts(sql, 'clips');
  console.log(`   clips: ${clips.length}`);

  // Импорт
  console.log('\n' + '='.repeat(60));

  await importTracks(tracks, artistMap);
  await importVideos(clips, artistMap);

  console.log('\n' + '='.repeat(60));
  console.log('✅ ИМПОРТ ЗАВЕРШЁН');
}

main().catch(console.error);
