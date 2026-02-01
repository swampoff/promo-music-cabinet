/**
 * Массовая рассылка приглашений мигрированным пользователям
 *
 * Запуск: npx tsx send-welcome-emails.ts
 *
 * Требуется:
 * 1. Настроить RESEND_API_KEY в Supabase Edge Functions
 * 2. Задеплоить send-email функцию: supabase functions deploy send-email
 */

import { createClient } from '@supabase/supabase-js';
import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: join(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

interface ArtistData {
  id: string;
  email: string;
  full_name: string;
}

async function main() {
  console.log('📧 РАССЫЛКА ПРИГЛАШЕНИЙ МИГРИРОВАННЫМ ПОЛЬЗОВАТЕЛЯМ\n');
  console.log('='.repeat(60));

  // Получить всех артистов с email
  console.log('\n📊 Загрузка списка артистов...');

  const { data: artists, error: artistsError } = await supabase
    .from('artists')
    .select('id, email, full_name')
    .not('email', 'is', null);

  if (artistsError) {
    console.error('❌ Ошибка загрузки артистов:', artistsError.message);
    return;
  }

  console.log(`   Найдено артистов: ${artists.length}`);

  // Получить количество треков для каждого артиста
  const { data: trackCounts } = await supabase
    .from('tracks')
    .select('artist_id');

  const tracksPerArtist: Record<string, number> = {};
  trackCounts?.forEach(t => {
    tracksPerArtist[t.artist_id] = (tracksPerArtist[t.artist_id] || 0) + 1;
  });

  // Получить количество видео для каждого артиста
  const { data: videoCounts } = await supabase
    .from('videos')
    .select('artist_id');

  const videosPerArtist: Record<string, number> = {};
  videoCounts?.forEach(v => {
    videosPerArtist[v.artist_id] = (videosPerArtist[v.artist_id] || 0) + 1;
  });

  // Подготовить данные для рассылки
  const emailData = artists.map((artist: ArtistData) => ({
    email: artist.email,
    name: artist.full_name || 'Артист',
    tracksCount: tracksPerArtist[artist.id] || 0,
    videosCount: videosPerArtist[artist.id] || 0,
  }));

  console.log(`\n📋 Подготовлено писем: ${emailData.length}`);

  // Подтверждение
  console.log('\n⚠️  Для отправки писем нужно:');
  console.log('   1. Настроить RESEND_API_KEY в Supabase');
  console.log('   2. Задеплоить Edge Function: supabase functions deploy send-email');
  console.log('\n   Чтобы отправить письма, раскомментируйте код ниже.');

  // РАСКОММЕНТИРУЙТЕ ДЛЯ ОТПРАВКИ:
  /*
  console.log('\n📤 Отправка писем...\n');

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < emailData.length; i++) {
    const data = emailData[i];

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({
          to: data.email,
          template: 'migration_welcome',
          data: {
            email: data.email,
            name: data.name,
            tracksCount: data.tracksCount,
            videosCount: data.videosCount,
          },
        }),
      });

      if (response.ok) {
        sent++;
        if (sent % 50 === 0) {
          console.log(`   Отправлено: ${sent}/${emailData.length}`);
        }
      } else {
        failed++;
        const error = await response.json();
        console.error(`   ❌ ${data.email}: ${error.error}`);
      }

      // Задержка между письмами
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err: any) {
      failed++;
      console.error(`   ❌ ${data.email}: ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Отправлено: ${sent}`);
  console.log(`❌ Ошибок: ${failed}`);
  */

  // Сохранить список для ручной рассылки
  const listPath = join(__dirname, `email_list_${Date.now()}.json`);
  fs.writeFileSync(listPath, JSON.stringify(emailData, null, 2));
  console.log(`\n📁 Список email сохранён: ${listPath}`);

  // Показать примеры
  console.log('\n📋 Примеры данных:');
  emailData.slice(0, 5).forEach((d, i) => {
    console.log(`   ${i + 1}. ${d.email} - ${d.name} (${d.tracksCount} треков, ${d.videosCount} видео)`);
  });
}

main().catch(console.error);
