/**
 * Создание таблиц в Supabase через прямое подключение к PostgreSQL
 *
 * Использование:
 * 1. Добавьте DATABASE_URL в .env
 * 2. Запустите: npx tsx create-tables.ts
 */

import { config as dotenvConfig } from 'dotenv';
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenvConfig();

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  // DATABASE_URL должен быть в формате:
  // postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log('❌ DATABASE_URL не найден в .env');
    console.log('\n📋 Как получить DATABASE_URL:');
    console.log('   1. Откройте https://supabase.com/dashboard/project/qzpmiiqfwkcnrhvubdgt/settings/database');
    console.log('   2. Скопируйте "Connection string" (URI format)');
    console.log('   3. Добавьте в .env: DATABASE_URL=postgresql://...');
    console.log('\n📋 Или выполните SQL вручную:');
    console.log('   1. Откройте https://supabase.com/dashboard/project/qzpmiiqfwkcnrhvubdgt/sql/new');
    console.log('   2. Скопируйте содержимое файла 01_create_tables.sql');
    console.log('   3. Нажмите Run');
    process.exit(1);
  }

  console.log('🔌 Подключение к Supabase PostgreSQL...\n');

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Подключено к базе данных\n');

    // Читаем SQL файл
    const sqlPath = path.join(__dirname, '01_create_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('📄 Выполняю SQL из 01_create_tables.sql...\n');

    // Выполняем SQL
    await client.query(sql);

    console.log('✅ Таблицы успешно созданы!\n');

    // Проверяем созданные таблицы
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('📊 Созданные таблицы:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

  } catch (error: any) {
    console.error('❌ Ошибка:', error.message);
    if (error.message.includes('authentication')) {
      console.log('\n💡 Проверьте правильность DATABASE_URL');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
