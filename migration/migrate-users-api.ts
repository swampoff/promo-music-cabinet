/**
 * API для миграции пользователей
 *
 * Этот скрипт создаёт пользователей в Supabase Auth
 * и профили артистов в базе данных
 *
 * Использование:
 * npx tsx migrate-users-api.ts
 */

import { createClient } from '@supabase/supabase-js';
import mysql from 'mysql2/promise';
import * as crypto from 'crypto';

// ============================================
// КОНФИГУРАЦИЯ
// ============================================

const config = {
  supabaseUrl: process.env.SUPABASE_URL || 'https://qzpmiiqfwkcnrhvubdgt.supabase.co',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '', // ВАЖНО: Service Role Key

  mysql: {
    host: process.env.OLD_DB_HOST || 'localhost',
    user: process.env.OLD_DB_USER || 'root',
    password: process.env.OLD_DB_PASSWORD || '',
    database: process.env.OLD_DB_NAME || 'human_promofmru',
  },

  // Только артисты (группы 1 и 2)
  userGroups: [1, 2],

  // Пакетная обработка
  batchSize: 50,
  delayBetweenBatches: 2000,

  // Отправка писем с временными паролями
  sendWelcomeEmails: false, // включить когда готовы
};

// ============================================
// ТИПЫ
// ============================================

interface OldUser {
  id: number;
  email: string;
  password2: string;
  group: number;
  ProfileArtistName: string;
  ProfileArtistAbout: string;
  ProfileArtistStyle: string;
  ProfileArtistFoundation: number;
  ProfileArtistTeam: string;
  ProfileCity: string;
  ProfileCity2: string;
  ProfileRegion: string;
  ProfileCountry: string;
  ProfileLabel: string;
  ProfilePhone: string;
  ProfileEmail: string;
  ProfileVkontakte: string;
  ProfileFacebook: string;
  Profileinst: string;
  ProfileTwitter: string;
  ProfileTiktok: string;
  ProfileOndoklassniki: string;
  ProfileSite: string;
  ProfileSkype: string;
  ProfileSpotify: string;
  ProfileMusic: string;
  ProfileMyspace: string;
  logo: string;
  reg_date: number;
  last_visit: number;
  registered: number;
}

interface MigrationResult {
  legacyId: number;
  email: string;
  newUserId?: string;
  newProfileId?: string;
  tempPassword?: string;
  success: boolean;
  error?: string;
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
  auth: { persistSession: false },
});

// ============================================
// УТИЛИТЫ
// ============================================

function generateTempPassword(): string {
  return crypto.randomBytes(8).toString('base64').replace(/[/+=]/g, '').slice(0, 12);
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function cleanJsonValue(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== '') {
      result[key] = value;
    }
  }
  return result;
}

function parseGenres(style: string): string[] {
  if (!style || style.trim() === '') return [];

  const normalizeMap: Record<string, string> = {
    'поп': 'Pop',
    'pop': 'Pop',
    'рок': 'Rock',
    'rock': 'Rock',
    'хип-хоп': 'Hip-Hop',
    'hip-hop': 'Hip-Hop',
    'рэп': 'Hip-Hop',
    'rap': 'Hip-Hop',
    'электроника': 'Electronic',
    'electronic': 'Electronic',
    'r&b': 'R&B',
    'rnb': 'R&B',
    'джаз': 'Jazz',
    'jazz': 'Jazz',
    'шансон': 'Chanson',
    'chanson': 'Chanson',
    'dance': 'Dance',
    'дэнс': 'Dance',
  };

  const normalized = normalizeMap[style.toLowerCase().trim()];
  return [normalized || style.trim()];
}

function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    '1': 'Россия',
    '2': 'Украина',
    '3': 'Беларусь',
    '4': 'Казахстан',
  };
  return countries[code] || 'Россия';
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// МИГРАЦИЯ ОДНОГО ПОЛЬЗОВАТЕЛЯ
// ============================================

async function migrateUser(user: OldUser): Promise<MigrationResult> {
  const email = normalizeEmail(user.email);
  const tempPassword = generateTempPassword();

  // 1. Создаём пользователя в Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true, // Сразу подтверждаем email
    user_metadata: {
      legacy_user_id: user.id,
      display_name: user.ProfileArtistName || `Артист #${user.id}`,
      migrated: true,
    },
  });

  if (authError) {
    // Если пользователь уже существует, пробуем найти его
    if (authError.message.includes('already registered')) {
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users.find((u) => u.email === email);

      if (existingUser) {
        return {
          legacyId: user.id,
          email,
          newUserId: existingUser.id,
          success: false,
          error: 'User already exists',
        };
      }
    }

    return {
      legacyId: user.id,
      email,
      success: false,
      error: authError.message,
    };
  }

  const newUserId = authData.user.id;

  // 2. Создаём профиль артиста
  const socialLinks = cleanJsonValue({
    vk: user.ProfileVkontakte,
    facebook: user.ProfileFacebook,
    instagram: user.Profileinst,
    twitter: user.ProfileTwitter,
    tiktok: user.ProfileTiktok,
    ok: user.ProfileOndoklassniki,
    website: user.ProfileSite,
    skype: user.ProfileSkype,
  });

  const streamingLinks = cleanJsonValue({
    spotify: user.ProfileSpotify,
    apple_music: user.ProfileMusic,
    myspace: user.ProfileMyspace,
  });

  const profileData = {
    user_id: newUserId,
    legacy_user_id: user.id,
    display_name: user.ProfileArtistName || `Артист #${user.id}`,
    bio: user.ProfileArtistAbout || null,
    artist_type: user.group === 1 ? 'solo' : 'band',
    founded_year: user.ProfileArtistFoundation || null,
    label_name: user.ProfileLabel || null,
    city: user.ProfileCity || user.ProfileCity2 || null,
    region: user.ProfileRegion || null,
    country: getCountryName(user.ProfileCountry),
    social_links: Object.keys(socialLinks).length > 0 ? socialLinks : {},
    streaming_links: Object.keys(streamingLinks).length > 0 ? streamingLinks : {},
    contact_email: user.ProfileEmail || null,
    contact_phone: user.ProfilePhone || null,
    genres: parseGenres(user.ProfileArtistStyle),
    status: 'active',
    migrated_at: new Date().toISOString(),
    created_at: user.reg_date ? new Date(user.reg_date * 1000).toISOString() : new Date().toISOString(),
  };

  const { data: profileResult, error: profileError } = await supabase
    .from('artist_profiles')
    .insert(profileData)
    .select('id')
    .single();

  if (profileError) {
    // Удаляем созданного пользователя если профиль не создался
    await supabase.auth.admin.deleteUser(newUserId);

    return {
      legacyId: user.id,
      email,
      newUserId,
      success: false,
      error: `Profile creation failed: ${profileError.message}`,
    };
  }

  // 3. Сохраняем маппинг
  await supabase.from('migration_mapping').insert({
    entity_type: 'user',
    legacy_id: user.id,
    new_id: newUserId,
  });

  return {
    legacyId: user.id,
    email,
    newUserId,
    newProfileId: profileResult.id,
    tempPassword,
    success: true,
  };
}

// ============================================
// ГЛАВНАЯ ФУНКЦИЯ
// ============================================

async function main() {
  console.log('🚀 Миграция пользователей promo.fm -> PROMO.MUSIC\n');
  console.log('='.repeat(50));

  // Подключение к MySQL
  let connection: mysql.Connection;

  try {
    connection = await mysql.createConnection(config.mysql);
    console.log('✅ Подключение к MySQL установлено\n');
  } catch (err) {
    console.error('❌ Ошибка подключения к MySQL:', err);
    return;
  }

  try {
    // Получаем всех артистов
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT *
      FROM users
      WHERE \`group\` IN (?, ?)
        AND email IS NOT NULL
        AND TRIM(email) != ''
        AND registered = 1
      ORDER BY id
    `, config.userGroups);

    const users = rows as OldUser[];
    console.log(`📊 Найдено ${users.length} артистов для миграции\n`);

    // Проверка дубликатов email
    const emailCounts = new Map<string, number>();
    for (const user of users) {
      const email = normalizeEmail(user.email);
      emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
    }

    const duplicates = [...emailCounts.entries()].filter(([, count]) => count > 1);
    if (duplicates.length > 0) {
      console.log(`⚠️  Найдено ${duplicates.length} дублирующихся email:`);
      duplicates.slice(0, 10).forEach(([email, count]) => {
        console.log(`   ${email}: ${count} записей`);
      });
      console.log('\n');
    }

    // Фильтруем уникальные email (берём первого)
    const seenEmails = new Set<string>();
    const uniqueUsers = users.filter((user) => {
      const email = normalizeEmail(user.email);
      if (seenEmails.has(email)) return false;
      seenEmails.add(email);
      return true;
    });

    console.log(`📝 Уникальных пользователей: ${uniqueUsers.length}\n`);

    // Миграция пакетами
    const results: MigrationResult[] = [];
    const batches: OldUser[][] = [];

    for (let i = 0; i < uniqueUsers.length; i += config.batchSize) {
      batches.push(uniqueUsers.slice(i, i + config.batchSize));
    }

    let processedCount = 0;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`\n📦 Обработка пакета ${batchIndex + 1}/${batches.length}...`);

      for (const user of batch) {
        const result = await migrateUser(user);
        results.push(result);

        if (result.success) {
          console.log(`  ✅ ${result.email} -> ${result.newUserId?.slice(0, 8)}...`);
        } else {
          console.log(`  ❌ ${result.email}: ${result.error}`);
        }
      }

      processedCount += batch.length;
      console.log(`  Прогресс: ${processedCount}/${uniqueUsers.length}`);

      if (batchIndex < batches.length - 1) {
        await delay(config.delayBetweenBatches);
      }
    }

    // Итоговый отчёт
    console.log('\n' + '='.repeat(50));
    console.log('📊 ИТОГОВЫЙ ОТЧЁТ\n');

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    console.log(`✅ Успешно мигрировано: ${successful.length}`);
    console.log(`❌ Ошибки: ${failed.length}`);

    if (failed.length > 0) {
      console.log('\nОшибки:');
      failed.slice(0, 20).forEach((r) => {
        console.log(`  - ${r.email}: ${r.error}`);
      });
      if (failed.length > 20) {
        console.log(`  ... и ещё ${failed.length - 20} ошибок`);
      }
    }

    // Сохраняем результаты
    const reportData = {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      timestamp: new Date().toISOString(),
      results: results.map((r) => ({
        legacyId: r.legacyId,
        email: r.email,
        newUserId: r.newUserId,
        success: r.success,
        error: r.error,
        // НЕ сохраняем временные пароли в файл!
      })),
    };

    const fs = await import('fs');
    const reportPath = `./migration_users_report_${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Отчёт сохранён: ${reportPath}`);

    // Сохраняем временные пароли отдельно (для отправки пользователям)
    if (config.sendWelcomeEmails) {
      const passwordsData = successful.map((r) => ({
        email: r.email,
        tempPassword: r.tempPassword,
      }));
      const passwordsPath = `./migration_passwords_${Date.now()}.json`;
      fs.writeFileSync(passwordsPath, JSON.stringify(passwordsData, null, 2));
      console.log(`🔐 Временные пароли сохранены: ${passwordsPath}`);
      console.log('   ⚠️  ВНИМАНИЕ: Удалите этот файл после отправки писем!');
    }

  } finally {
    await connection.end();
  }
}

// Запуск
main().catch(console.error);
