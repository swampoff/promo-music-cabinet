/**
 * Скрипт миграции файлов из старого сервера в Supabase Storage
 *
 * Использование:
 * 1. Установить зависимости: npm install @supabase/supabase-js mysql2 dotenv
 * 2. Настроить .env файл
 * 3. Запустить: npx tsx migrate-files.ts
 */

import { createClient } from '@supabase/supabase-js';
import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

// ============================================
// КОНФИГУРАЦИЯ
// ============================================

const config = {
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || 'https://qzpmiiqfwkcnrhvubdgt.supabase.co',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '', // Service Role Key!

  // MySQL (старая база)
  mysql: {
    host: process.env.OLD_DB_HOST || 'localhost',
    user: process.env.OLD_DB_USER || 'root',
    password: process.env.OLD_DB_PASSWORD || '',
    database: process.env.OLD_DB_NAME || 'human_promofmru',
  },

  // Старый сервер с файлами
  oldServerUrl: process.env.OLD_SERVER_URL || 'https://promo.fm',
  oldFilePaths: {
    tracks: '/uploads/tracks/',
    covers: '/uploads/covers/',
    avatars: '/uploads/avatars/',
    clips: '/uploads/clips/',
  },

  // Storage buckets в Supabase
  buckets: {
    audio: 'make-84730125-audio-files',
    covers: 'make-84730125-track-covers',
    avatars: 'make-84730125-artist-avatars',
    videos: 'make-84730125-video-files',
  },

  // Лимиты
  batchSize: 10, // файлов за раз
  delayBetweenBatches: 1000, // мс
};

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
  auth: { persistSession: false },
});

interface MigrationResult {
  success: boolean;
  legacyId: number;
  oldPath: string;
  newPath?: string;
  newUrl?: string;
  error?: string;
}

// ============================================
// УТИЛИТЫ
// ============================================

async function downloadFile(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Редирект
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadFile(redirectUrl).then(resolve);
          return;
        }
      }

      if (response.statusCode !== 200) {
        console.error(`Failed to download ${url}: ${response.statusCode}`);
        resolve(null);
        return;
      }

      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', () => resolve(null));
    }).on('error', () => resolve(null));
  });
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const types: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.flac': 'audio/flac',
    '.ogg': 'audio/ogg',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  return types[ext] || 'application/octet-stream';
}

async function uploadToStorage(
  bucket: string,
  filePath: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<{ url: string } | { error: string }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    return { error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return { url: urlData.publicUrl };
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// МИГРАЦИЯ АВАТАРОВ
// ============================================

async function migrateAvatars(connection: mysql.Connection): Promise<MigrationResult[]> {
  console.log('\n📷 Миграция аватаров...');

  const [rows] = await connection.execute<mysql.RowDataPacket[]>(`
    SELECT p.id, p.user_id, p.filename, u.ProfileArtistName
    FROM photo p
    JOIN users u ON u.id = p.user_id
    WHERE p.is_avatar = 1 AND p.filename IS NOT NULL AND p.filename != ''
  `);

  const results: MigrationResult[] = [];
  const batches = [];

  for (let i = 0; i < rows.length; i += config.batchSize) {
    batches.push(rows.slice(i, i + config.batchSize));
  }

  for (const batch of batches) {
    const batchPromises = batch.map(async (row) => {
      const oldUrl = `${config.oldServerUrl}${config.oldFilePaths.avatars}${row.filename}`;
      const newPath = `${row.user_id}/avatar_${row.filename}`;

      try {
        const fileBuffer = await downloadFile(oldUrl);
        if (!fileBuffer) {
          return {
            success: false,
            legacyId: row.user_id,
            oldPath: oldUrl,
            error: 'Failed to download',
          };
        }

        const result = await uploadToStorage(
          config.buckets.avatars,
          newPath,
          fileBuffer,
          getContentType(row.filename)
        );

        if ('error' in result) {
          return {
            success: false,
            legacyId: row.user_id,
            oldPath: oldUrl,
            error: result.error,
          };
        }

        return {
          success: true,
          legacyId: row.user_id,
          oldPath: oldUrl,
          newPath,
          newUrl: result.url,
        };
      } catch (err) {
        return {
          success: false,
          legacyId: row.user_id,
          oldPath: oldUrl,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    const successCount = batchResults.filter((r) => r.success).length;
    console.log(`  Batch: ${successCount}/${batchResults.length} успешно`);

    await delay(config.delayBetweenBatches);
  }

  return results;
}

// ============================================
// МИГРАЦИЯ ТРЕКОВ
// ============================================

async function migrateTracks(connection: mysql.Connection): Promise<MigrationResult[]> {
  console.log('\n🎵 Миграция аудиофайлов треков...');

  const [rows] = await connection.execute<mysql.RowDataPacket[]>(`
    SELECT id, user_id, file_uploaded, songname
    FROM tracks
    WHERE file_uploaded IS NOT NULL AND file_uploaded != ''
    ORDER BY id
  `);

  console.log(`  Найдено ${rows.length} треков`);

  const results: MigrationResult[] = [];
  const batches = [];

  for (let i = 0; i < rows.length; i += config.batchSize) {
    batches.push(rows.slice(i, i + config.batchSize));
  }

  let processedCount = 0;

  for (const batch of batches) {
    const batchPromises = batch.map(async (row) => {
      const oldUrl = `${config.oldServerUrl}${config.oldFilePaths.tracks}${row.file_uploaded}`;
      const newPath = `${row.user_id}/tracks/${row.id}_${row.file_uploaded}`;

      try {
        const fileBuffer = await downloadFile(oldUrl);
        if (!fileBuffer) {
          return {
            success: false,
            legacyId: row.id,
            oldPath: oldUrl,
            error: 'Failed to download',
          };
        }

        const result = await uploadToStorage(
          config.buckets.audio,
          newPath,
          fileBuffer,
          getContentType(row.file_uploaded)
        );

        if ('error' in result) {
          return {
            success: false,
            legacyId: row.id,
            oldPath: oldUrl,
            error: result.error,
          };
        }

        return {
          success: true,
          legacyId: row.id,
          oldPath: oldUrl,
          newPath,
          newUrl: result.url,
        };
      } catch (err) {
        return {
          success: false,
          legacyId: row.id,
          oldPath: oldUrl,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    processedCount += batch.length;
    const successCount = batchResults.filter((r) => r.success).length;
    console.log(
      `  Прогресс: ${processedCount}/${rows.length} (${successCount}/${batch.length} в батче)`
    );

    await delay(config.delayBetweenBatches);
  }

  return results;
}

// ============================================
// МИГРАЦИЯ ОБЛОЖЕК ТРЕКОВ
// ============================================

async function migrateTrackCovers(connection: mysql.Connection): Promise<MigrationResult[]> {
  console.log('\n🖼️ Миграция обложек треков...');

  const [rows] = await connection.execute<mysql.RowDataPacket[]>(`
    SELECT id, user_id, photo
    FROM tracks
    WHERE photo IS NOT NULL AND photo != ''
  `);

  console.log(`  Найдено ${rows.length} обложек`);

  const results: MigrationResult[] = [];
  const batches = [];

  for (let i = 0; i < rows.length; i += config.batchSize) {
    batches.push(rows.slice(i, i + config.batchSize));
  }

  for (const batch of batches) {
    const batchPromises = batch.map(async (row) => {
      const oldUrl = `${config.oldServerUrl}${config.oldFilePaths.covers}${row.photo}`;
      const newPath = `${row.user_id}/covers/${row.id}_${row.photo}`;

      try {
        const fileBuffer = await downloadFile(oldUrl);
        if (!fileBuffer) {
          return {
            success: false,
            legacyId: row.id,
            oldPath: oldUrl,
            error: 'Failed to download',
          };
        }

        const result = await uploadToStorage(
          config.buckets.covers,
          newPath,
          fileBuffer,
          getContentType(row.photo)
        );

        if ('error' in result) {
          return {
            success: false,
            legacyId: row.id,
            oldPath: oldUrl,
            error: result.error,
          };
        }

        return {
          success: true,
          legacyId: row.id,
          oldPath: oldUrl,
          newPath,
          newUrl: result.url,
        };
      } catch (err) {
        return {
          success: false,
          legacyId: row.id,
          oldPath: oldUrl,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    await delay(config.delayBetweenBatches);
  }

  return results;
}

// ============================================
// МИГРАЦИЯ ВИДЕО
// ============================================

async function migrateVideos(connection: mysql.Connection): Promise<MigrationResult[]> {
  console.log('\n🎬 Миграция видеофайлов...');

  const [rows] = await connection.execute<mysql.RowDataPacket[]>(`
    SELECT id, user_id, clip, cover
    FROM clips
    WHERE clip IS NOT NULL AND clip != ''
  `);

  console.log(`  Найдено ${rows.length} видео`);

  const results: MigrationResult[] = [];
  const batches = [];

  for (let i = 0; i < rows.length; i += config.batchSize) {
    batches.push(rows.slice(i, i + config.batchSize));
  }

  for (const batch of batches) {
    const batchPromises = batch.map(async (row) => {
      const oldUrl = `${config.oldServerUrl}${config.oldFilePaths.clips}${row.clip}`;
      const newPath = `${row.user_id}/videos/${row.id}_${row.clip}`;

      try {
        const fileBuffer = await downloadFile(oldUrl);
        if (!fileBuffer) {
          return {
            success: false,
            legacyId: row.id,
            oldPath: oldUrl,
            error: 'Failed to download',
          };
        }

        const result = await uploadToStorage(
          config.buckets.videos,
          newPath,
          fileBuffer,
          getContentType(row.clip)
        );

        if ('error' in result) {
          return {
            success: false,
            legacyId: row.id,
            oldPath: oldUrl,
            error: result.error,
          };
        }

        return {
          success: true,
          legacyId: row.id,
          oldPath: oldUrl,
          newPath,
          newUrl: result.url,
        };
      } catch (err) {
        return {
          success: false,
          legacyId: row.id,
          oldPath: oldUrl,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    await delay(config.delayBetweenBatches);
  }

  return results;
}

// ============================================
// ОБНОВЛЕНИЕ URL В БАЗЕ
// ============================================

async function updateDatabaseUrls(results: MigrationResult[], entityType: string): Promise<void> {
  console.log(`\n📝 Обновление URL в базе для ${entityType}...`);

  const successResults = results.filter((r) => r.success && r.newUrl);

  for (const result of successResults) {
    let updateQuery = '';

    switch (entityType) {
      case 'avatar':
        updateQuery = `
          UPDATE artist_profiles
          SET avatar_url = $1
          WHERE legacy_user_id = $2
        `;
        break;
      case 'track':
        updateQuery = `
          UPDATE tracks
          SET audio_url = $1
          WHERE legacy_track_id = $2
        `;
        break;
      case 'cover':
        updateQuery = `
          UPDATE tracks
          SET cover_url = $1
          WHERE legacy_track_id = $2
        `;
        break;
      case 'video':
        updateQuery = `
          UPDATE videos
          SET video_url = $1
          WHERE legacy_clip_id = $2
        `;
        break;
    }

    if (updateQuery) {
      await supabase.rpc('execute_sql', {
        query: updateQuery,
        params: [result.newUrl, result.legacyId],
      });
    }
  }

  console.log(`  Обновлено ${successResults.length} записей`);
}

// ============================================
// ГЛАВНАЯ ФУНКЦИЯ
// ============================================

async function main() {
  console.log('🚀 Начало миграции файлов promo.fm -> PROMO.MUSIC\n');
  console.log('='.repeat(50));

  // Подключение к старой MySQL базе
  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection(config.mysql);
    console.log('✅ Подключение к MySQL установлено');
  } catch (err) {
    console.error('❌ Ошибка подключения к MySQL:', err);
    console.log('\n⚠️  Работа в режиме без базы данных');
    console.log('   Убедитесь, что настроены переменные окружения:');
    console.log('   OLD_DB_HOST, OLD_DB_USER, OLD_DB_PASSWORD, OLD_DB_NAME');
    return;
  }

  const allResults: Record<string, MigrationResult[]> = {};

  try {
    // 1. Аватары
    allResults.avatars = await migrateAvatars(connection);
    await updateDatabaseUrls(allResults.avatars, 'avatar');

    // 2. Треки
    allResults.tracks = await migrateTracks(connection);
    await updateDatabaseUrls(allResults.tracks, 'track');

    // 3. Обложки треков
    allResults.covers = await migrateTrackCovers(connection);
    await updateDatabaseUrls(allResults.covers, 'cover');

    // 4. Видео
    allResults.videos = await migrateVideos(connection);
    await updateDatabaseUrls(allResults.videos, 'video');

  } finally {
    if (connection) {
      await connection.end();
    }
  }

  // Итоговый отчёт
  console.log('\n' + '='.repeat(50));
  console.log('📊 ИТОГОВЫЙ ОТЧЁТ\n');

  for (const [type, results] of Object.entries(allResults)) {
    const success = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    console.log(`${type}: ${success} успешно, ${failed} ошибок`);
  }

  // Сохранение отчёта
  const reportPath = `./migration_report_${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(allResults, null, 2));
  console.log(`\n📄 Отчёт сохранён: ${reportPath}`);
}

// Запуск
main().catch(console.error);
