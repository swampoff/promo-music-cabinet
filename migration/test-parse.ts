/**
 * Тест парсинга SQL экспорта (без импорта в Supabase)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Простой парсер INSERT statements
function parseTable(sql: string, tableName: string): any[] {
  const results: any[] = [];

  // Найти секцию с INSERT для таблицы
  const startMarker = `INSERT INTO \`${tableName}\``;
  const startIndex = sql.indexOf(startMarker);
  if (startIndex === -1) return results;

  // Найти конец секции (следующий CREATE TABLE или INSERT INTO другой таблицы)
  let endIndex = sql.length;
  const nextCreate = sql.indexOf('CREATE TABLE', startIndex + 1);
  const nextInsert = sql.indexOf('INSERT INTO', startIndex + startMarker.length);

  if (nextCreate > 0 && nextCreate < endIndex) endIndex = nextCreate;
  if (nextInsert > 0 && nextInsert < endIndex) endIndex = nextInsert;

  const section = sql.substring(startIndex, endIndex);

  // Получить колонки
  const columnsMatch = section.match(/\(([^)]+)\) VALUES/);
  if (!columnsMatch) return results;

  const columns = columnsMatch[1].split(',').map(c => c.replace(/`/g, '').trim());

  // Получить VALUES часть
  const valuesStart = section.indexOf('VALUES') + 6;
  let valuesStr = section.substring(valuesStart).trim();

  // Убираем финальную точку с запятой
  valuesStr = valuesStr.replace(/;\s*$/, '');

  // Разбиваем на строки по ),( или ),\n(
  // Это сложно из-за вложенных скобок и строк с запятыми
  // Используем состояние

  let current = '';
  let inString = false;
  let stringChar = '';
  let depth = 0;
  let rowStart = false;

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
      if (depth === 0) {
        rowStart = true;
        current = '';
      } else {
        current += char;
      }
      depth++;
    } else if (!inString && char === ')') {
      depth--;
      if (depth === 0 && rowStart) {
        // Конец строки
        const values = parseValues(current);
        if (values.length === columns.length) {
          const obj: any = {};
          columns.forEach((col, idx) => {
            obj[col] = values[idx];
          });
          results.push(obj);
        }
        rowStart = false;
        current = '';
      } else {
        current += char;
      }
    } else if (depth > 0) {
      current += char;
    }
  }

  return results;
}

function parseValues(str: string): any[] {
  const values: any[] = [];
  let current = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const prev = str[i - 1];

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
  if (val === 'NULL') return null;
  if (/^-?\d+$/.test(val)) return parseInt(val);
  if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val);

  if ((val.startsWith("'") && val.endsWith("'")) ||
      (val.startsWith('"') && val.endsWith('"'))) {
    return val.slice(1, -1)
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&quot;/g, '"');
  }

  return val;
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('🔍 Тест парсинга SQL экспорта\n');
  console.log('='.repeat(60));

  const sqlPath = path.join(__dirname, 'data_export.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  console.log(`\n📂 Файл: ${sqlPath}`);
  console.log(`   Размер: ${(sql.length / 1024 / 1024).toFixed(2)} MB\n`);

  // Парсим таблицы
  console.log('📊 Парсинг таблиц...\n');

  const users = parseTable(sql, 'users');
  console.log(`   users: ${users.length} записей`);

  const tracks = parseTable(sql, 'tracks');
  console.log(`   tracks: ${tracks.length} записей`);

  const clips = parseTable(sql, 'clips');
  console.log(`   clips: ${clips.length} записей`);

  const photos = parseTable(sql, 'photo');
  console.log(`   photo: ${photos.length} записей`);

  // Анализ пользователей
  console.log('\n' + '='.repeat(60));
  console.log('\n👥 АНАЛИЗ ПОЛЬЗОВАТЕЛЕЙ\n');

  const groups: Record<number, number> = {};
  const withEmail: number[] = [];
  const artists: any[] = [];

  for (const user of users) {
    const group = user.group || 0;
    groups[group] = (groups[group] || 0) + 1;

    if (user.email && user.email.includes('@')) {
      withEmail.push(user.id);
    }

    if ((group === 1 || group === 2) && user.email) {
      artists.push(user);
    }
  }

  console.log('   По группам:');
  const groupNames: Record<number, string> = {
    1: 'Артист (Solo)',
    2: 'Артист (Группа)',
    3: 'Радио',
    4: 'Рецензент',
    5: 'Админ',
  };
  for (const [group, count] of Object.entries(groups).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    console.log(`     ${groupNames[Number(group)] || `Группа ${group}`}: ${count}`);
  }

  console.log(`\n   С email: ${withEmail.length}`);
  console.log(`   Артистов для миграции: ${artists.length}`);

  // Дубликаты email
  const emails = artists.map(a => a.email?.toLowerCase());
  const duplicates = emails.filter((e, i) => emails.indexOf(e) !== i);
  console.log(`   Дубликатов email: ${new Set(duplicates).size}`);

  // Примеры артистов
  console.log('\n   📋 Примеры артистов:');
  artists.slice(0, 5).forEach(a => {
    console.log(`\n     #${a.id}: ${a.ProfileArtistName || 'Без имени'}`);
    console.log(`        Email: ${a.email}`);
    console.log(`        Город: ${a.ProfileCity || '-'}`);
    console.log(`        Жанр: ${a.ProfileArtistStyle || '-'}`);
    console.log(`        VK: ${a.ProfileVkontakte || '-'}`);
  });

  // Анализ треков
  console.log('\n' + '='.repeat(60));
  console.log('\n🎵 АНАЛИЗ ТРЕКОВ\n');

  const tracksByStatus: Record<number, number> = {};
  const tracksWithFile = tracks.filter(t => t.file_uploaded);
  const trackArtists = new Set(tracks.map(t => t.user_id));

  for (const track of tracks) {
    const status = track.status || 0;
    tracksByStatus[status] = (tracksByStatus[status] || 0) + 1;
  }

  console.log('   По статусам:');
  const statusNames: Record<number, string> = { 0: 'На модерации', 1: 'Одобрен', 2: 'Отклонён', 3: 'В архиве' };
  for (const [status, count] of Object.entries(tracksByStatus)) {
    console.log(`     ${statusNames[Number(status)] || `Статус ${status}`}: ${count}`);
  }

  console.log(`\n   С аудиофайлом: ${tracksWithFile.length}`);
  console.log(`   Уникальных артистов: ${trackArtists.size}`);

  // Жанры
  const genres: Record<string, number> = {};
  for (const track of tracks) {
    const genre = track.song_style || 'Не указан';
    genres[genre] = (genres[genre] || 0) + 1;
  }

  console.log('\n   Топ-10 жанров:');
  Object.entries(genres)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([genre, count]) => {
      console.log(`     ${genre}: ${count}`);
    });

  // Примеры треков
  console.log('\n   📋 Примеры треков:');
  tracks.slice(0, 5).forEach(t => {
    console.log(`\n     #${t.id}: ${t.songname || 'Без названия'}`);
    console.log(`        Артист ID: ${t.user_id}`);
    console.log(`        Жанр: ${t.song_style || '-'}`);
    console.log(`        Файл: ${t.file_uploaded || '-'}`);
    console.log(`        Статус: ${statusNames[t.status] || t.status}`);
  });

  // Анализ клипов
  console.log('\n' + '='.repeat(60));
  console.log('\n🎬 АНАЛИЗ ВИДЕО\n');

  const youtubeClips = clips.filter(c => c.embed?.includes('youtube'));
  console.log(`   Всего: ${clips.length}`);
  console.log(`   С YouTube: ${youtubeClips.length}`);

  // Примеры
  console.log('\n   📋 Примеры видео:');
  clips.slice(0, 3).forEach(c => {
    const ytMatch = c.embed?.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    console.log(`\n     #${c.id}: ${c.songname || 'Без названия'}`);
    console.log(`        YouTube ID: ${ytMatch ? ytMatch[1] : '-'}`);
    console.log(`        Режиссёр: ${c.director || '-'}`);
  });

  // Итог
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ ИТОГО ДЛЯ МИГРАЦИИ:\n');

  const uniqueArtists = new Set(artists.map(a => a.email?.toLowerCase())).size;
  console.log(`   👥 Артистов: ${uniqueArtists} (уникальных по email)`);
  console.log(`   🎵 Треков: ${tracksWithFile.length} (с файлами)`);
  console.log(`   🎬 Видео: ${clips.length}`);
  console.log(`   📷 Фото: ${photos.length}`);
}

main().catch(console.error);
