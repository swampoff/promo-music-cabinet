/**
 * Анализ старой базы данных promo.fm
 *
 * Запуск: npx tsx analyze-old-db.ts
 */

import mysql from 'mysql2/promise';
import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Загружаем .env
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: join(__dirname, '.env') });

const config = {
  host: process.env.OLD_DB_HOST || '185.60.135.189',
  user: process.env.OLD_DB_USER || 'human_promofmru',
  password: process.env.OLD_DB_PASSWORD || '@kk7c7x887578',
  database: process.env.OLD_DB_NAME || 'human_promofmru',
  port: parseInt(process.env.OLD_DB_PORT || '3306'),
};

interface QueryResult {
  [key: string]: any;
}

async function main() {
  console.log('🔍 Анализ базы данных promo.fm\n');
  console.log('='.repeat(60));

  let connection: mysql.Connection;

  try {
    console.log(`\nПодключение к ${config.host}...`);
    connection = await mysql.createConnection(config);
    console.log('✅ Подключение установлено!\n');
  } catch (err) {
    console.error('❌ Ошибка подключения:', err);
    return;
  }

  try {
    // ============================================
    // 1. ОБЩАЯ СТАТИСТИКА
    // ============================================
    console.log('📊 ОБЩАЯ СТАТИСТИКА\n');

    const tables = [
      { name: 'users', label: 'Пользователи' },
      { name: 'tracks', label: 'Треки' },
      { name: 'clips', label: 'Видеоклипы' },
      { name: 'photo', label: 'Фотографии' },
      { name: 'payments', label: 'Платежи' },
      { name: 'reviews', label: 'Отзывы' },
    ];

    for (const table of tables) {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM ${table.name}`
      );
      console.log(`  ${table.label}: ${rows[0].count.toLocaleString()}`);
    }

    // ============================================
    // 2. ПОЛЬЗОВАТЕЛИ ПО ГРУППАМ
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('\n👥 ПОЛЬЗОВАТЕЛИ ПО ГРУППАМ\n');

    const [userGroups] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT
        \`group\`,
        CASE \`group\`
          WHEN 1 THEN 'Артист (Solo)'
          WHEN 2 THEN 'Артист (Группа)'
          WHEN 3 THEN 'Радио'
          WHEN 4 THEN 'Рецензент'
          WHEN 5 THEN 'Админ'
          ELSE 'Другое'
        END as group_name,
        COUNT(*) as count,
        SUM(CASE WHEN registered = 1 THEN 1 ELSE 0 END) as registered,
        SUM(CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END) as with_email
      FROM users
      GROUP BY \`group\`
      ORDER BY \`group\`
    `);

    console.log('  Группа                  | Всего | Зарег. | С email');
    console.log('  ' + '-'.repeat(55));
    for (const row of userGroups) {
      console.log(
        `  ${row.group_name.padEnd(22)} | ${String(row.count).padStart(5)} | ${String(row.registered).padStart(6)} | ${String(row.with_email).padStart(7)}`
      );
    }

    // ============================================
    // 3. АРТИСТЫ ДЛЯ МИГРАЦИИ
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('\n🎤 АРТИСТЫ ДЛЯ МИГРАЦИИ (группы 1 и 2)\n');

    const [artistStats] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN email IS NOT NULL AND TRIM(email) != '' AND registered = 1 THEN 1 ELSE 0 END) as valid,
        SUM(CASE WHEN ProfileArtistName IS NOT NULL AND ProfileArtistName != '' THEN 1 ELSE 0 END) as with_name,
        SUM(CASE WHEN ProfileArtistAbout IS NOT NULL AND ProfileArtistAbout != '' THEN 1 ELSE 0 END) as with_bio,
        SUM(CASE WHEN logo IS NOT NULL AND logo != '' THEN 1 ELSE 0 END) as with_avatar
      FROM users
      WHERE \`group\` IN (1, 2)
    `);

    const stats = artistStats[0];
    console.log(`  Всего артистов: ${stats.total}`);
    console.log(`  Валидных для миграции: ${stats.valid}`);
    console.log(`  С именем артиста: ${stats.with_name}`);
    console.log(`  С описанием: ${stats.with_bio}`);
    console.log(`  С аватаром: ${stats.with_avatar}`);

    // Дубликаты email
    const [duplicates] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT email, COUNT(*) as cnt
      FROM users
      WHERE \`group\` IN (1, 2) AND email IS NOT NULL AND email != ''
      GROUP BY email
      HAVING COUNT(*) > 1
    `);

    console.log(`\n  ⚠️  Дубликатов email: ${duplicates.length}`);

    // ============================================
    // 4. ТРЕКИ
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('\n🎵 ТРЕКИ\n');

    const [trackStats] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN archive = 1 THEN 1 ELSE 0 END) as archived,
        SUM(CASE WHEN file_uploaded IS NOT NULL AND file_uploaded != '' THEN 1 ELSE 0 END) as with_file,
        SUM(CASE WHEN photo IS NOT NULL AND photo != '' THEN 1 ELSE 0 END) as with_cover
      FROM tracks
    `);

    const ts = trackStats[0];
    console.log(`  Всего треков: ${ts.total}`);
    console.log(`  На модерации: ${ts.pending}`);
    console.log(`  Одобрено: ${ts.approved}`);
    console.log(`  Отклонено: ${ts.rejected}`);
    console.log(`  В архиве: ${ts.archived}`);
    console.log(`  С аудиофайлом: ${ts.with_file}`);
    console.log(`  С обложкой: ${ts.with_cover}`);

    // Топ жанров
    console.log('\n  Топ-10 жанров:');
    const [genres] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT song_style, COUNT(*) as count
      FROM tracks
      WHERE song_style IS NOT NULL AND song_style != ''
      GROUP BY song_style
      ORDER BY count DESC
      LIMIT 10
    `);

    for (const genre of genres) {
      console.log(`    - ${genre.song_style}: ${genre.count}`);
    }

    // ============================================
    // 5. ВИДЕОКЛИПЫ
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('\n🎬 ВИДЕОКЛИПЫ\n');

    const [clipStats] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN embed IS NOT NULL AND embed != '' THEN 1 ELSE 0 END) as with_embed,
        SUM(CASE WHEN clip IS NOT NULL AND clip != '' THEN 1 ELSE 0 END) as with_file,
        SUM(CASE WHEN embed LIKE '%youtube%' THEN 1 ELSE 0 END) as youtube
      FROM clips
    `);

    const cs = clipStats[0];
    console.log(`  Всего клипов: ${cs.total}`);
    console.log(`  Одобрено: ${cs.approved}`);
    console.log(`  С embed-кодом: ${cs.with_embed}`);
    console.log(`  С видеофайлом: ${cs.with_file}`);
    console.log(`  YouTube: ${cs.youtube}`);

    // ============================================
    // 6. ПЛАТЕЖИ
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('\n💳 ПЛАТЕЖИ\n');

    const [paymentStats] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN p_done = 1 THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN p_done = 1 THEN CAST(p_total AS DECIMAL(10,2)) ELSE 0 END) as total_amount
      FROM payments
    `);

    const ps = paymentStats[0];
    console.log(`  Всего платежей: ${ps.total}`);
    console.log(`  Успешных: ${ps.completed}`);
    console.log(`  Общая сумма: ${Number(ps.total_amount).toLocaleString()} руб.`);

    // ============================================
    // 7. ФАЙЛЫ
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('\n📁 ФАЙЛЫ ДЛЯ ПЕРЕНОСА\n');

    // Аватары
    const [avatars] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT COUNT(*) as count FROM photo WHERE is_avatar = 1 AND filename IS NOT NULL AND filename != ''
    `);
    console.log(`  Аватары: ${avatars[0].count}`);

    // Аудиофайлы
    const [audioFiles] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT COUNT(*) as count FROM tracks WHERE file_uploaded IS NOT NULL AND file_uploaded != ''
    `);
    console.log(`  Аудиофайлы треков: ${audioFiles[0].count}`);

    // Обложки
    const [covers] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT COUNT(*) as count FROM tracks WHERE photo IS NOT NULL AND photo != ''
    `);
    console.log(`  Обложки треков: ${covers[0].count}`);

    // Видео
    const [videoFiles] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT COUNT(*) as count FROM clips WHERE clip IS NOT NULL AND clip != ''
    `);
    console.log(`  Видеофайлы: ${videoFiles[0].count}`);

    // ============================================
    // 8. ПРИМЕРЫ ДАННЫХ
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('\n📋 ПРИМЕРЫ АРТИСТОВ (первые 5)\n');

    const [sampleArtists] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT
        id, email, ProfileArtistName, ProfileCity, ProfileArtistStyle,
        (SELECT COUNT(*) FROM tracks WHERE user_id = users.id) as tracks_count
      FROM users
      WHERE \`group\` IN (1, 2) AND registered = 1 AND email IS NOT NULL
      ORDER BY id
      LIMIT 5
    `);

    for (const artist of sampleArtists) {
      console.log(`  #${artist.id}: ${artist.ProfileArtistName || 'Без имени'}`);
      console.log(`     Email: ${artist.email}`);
      console.log(`     Город: ${artist.ProfileCity || '-'}`);
      console.log(`     Жанр: ${artist.ProfileArtistStyle || '-'}`);
      console.log(`     Треков: ${artist.tracks_count}`);
      console.log('');
    }

    // ============================================
    // ИТОГО
    // ============================================
    console.log('='.repeat(60));
    console.log('\n✅ ИТОГО ДЛЯ МИГРАЦИИ:\n');
    console.log(`  👥 Артистов: ~${stats.valid}`);
    console.log(`  🎵 Треков: ~${ts.with_file}`);
    console.log(`  🎬 Видео: ~${cs.total}`);
    console.log(`  📷 Файлов: ~${Number(avatars[0].count) + Number(audioFiles[0].count) + Number(covers[0].count) + Number(videoFiles[0].count)}`);

  } finally {
    await connection.end();
    console.log('\n🔌 Соединение закрыто');
  }
}

main().catch(console.error);
