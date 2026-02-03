#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env

/**
 * DIRECT DEPLOYMENT via Supabase REST API
 * 
 * Использует только REST API для максимальной совместимости
 * Не требует Supabase CLI
 * 
 * Что делает:
 * 1. Проверяет подключение к Supabase
 * 2. Создает таблицы через raw SQL
 * 3. Создает storage buckets
 * 4. Проверяет результат
 * 
 * Usage:
 *   deno run --allow-net --allow-read --allow-env deploy-direct.ts
 */

interface DeployConfig {
  supabaseUrl: string;
  serviceRoleKey: string;
}

class SupabaseDeployer {
  private config: DeployConfig;

  constructor(config: DeployConfig) {
    this.config = config;
  }

  private async executeSQL(sql: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Используем прямой POST запрос к PostgreSQL через PostgREST
      const response = await fetch(`${this.config.supabaseUrl}/rest/v1/rpc/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.config.serviceRoleKey,
          'Authorization': `Bearer ${this.config.serviceRoleKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ query: sql }),
      });

      if (response.ok) {
        return { success: true };
      }

      const errorText = await response.text();
      return { success: false, error: errorText };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async checkTableExists(tableName: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.config.supabaseUrl}/rest/v1/${tableName}?select=id&limit=1`,
        {
          headers: {
            'apikey': this.config.serviceRoleKey,
            'Authorization': `Bearer ${this.config.serviceRoleKey}`,
          },
        }
      );
      return response.ok || response.status === 200;
    } catch {
      return false;
    }
  }

  private async createBucket(name: string, options: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.config.supabaseUrl}/storage/v1/bucket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.config.serviceRoleKey,
          'Authorization': `Bearer ${this.config.serviceRoleKey}`,
        },
        body: JSON.stringify({
          name,
          public: options.public,
          file_size_limit: options.file_size_limit,
          allowed_mime_types: options.allowed_mime_types,
        }),
      });

      if (response.ok) {
        return { success: true };
      }

      const error = await response.json();
      if (error.message?.includes('already exists')) {
        return { success: true }; // Считаем успехом если уже существует
      }

      return { success: false, error: error.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deploy() {
    console.log('🚀 Starting deployment...\n');

    // 1. Проверка подключения
    console.log('1️⃣  Checking connection...');
    try {
      const response = await fetch(`${this.config.supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': this.config.serviceRoleKey,
          'Authorization': `Bearer ${this.config.serviceRoleKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Connection failed');
      }
      console.log('   ✅ Connected to Supabase\n');
    } catch (error) {
      console.error('   ❌ Connection failed:', error.message);
      return false;
    }

    // 2. Создание таблиц
    console.log('2️⃣  Creating tables from SQL migration...');
    try {
      const sql = await Deno.readTextFile('database/001_promotion_tables.sql');
      
      console.log('   📄 SQL file loaded');
      console.log('   🔧 This may take a while...');
      console.log('   ℹ️  If this fails, please run SQL manually in Dashboard\n');

      // Пытаемся выполнить весь SQL сразу
      const result = await this.executeSQL(sql);
      
      if (result.success) {
        console.log('   ✅ Tables created successfully\n');
      } else {
        console.log('   ⚠️  SQL execution had issues');
        console.log('   💡 Please run SQL manually in Supabase Dashboard → SQL Editor');
        console.log('   📁 File: database/001_promotion_tables.sql\n');
      }
    } catch (error) {
      console.error('   ❌ Error:', error.message);
      console.log('   💡 Please run SQL manually\n');
    }

    // 3. Проверка таблиц
    console.log('3️⃣  Verifying tables...');
    const tables = [
      'pitching_requests',
      'production_360_requests',
      'marketing_campaigns',
      'media_outreach_requests',
      'event_requests',
      'promo_lab_experiments',
      'editor_responses',
      'promotion_transactions',
    ];

    let createdTables = 0;
    for (const table of tables) {
      const exists = await this.checkTableExists(table);
      if (exists) {
        console.log(`   ✅ ${table}`);
        createdTables++;
      } else {
        console.log(`   ❌ ${table} - not found`);
      }
    }
    console.log(`   📊 ${createdTables}/${tables.length} tables verified\n`);

    // 4. Создание storage bucket
    console.log('4️⃣  Creating storage bucket...');
    const bucketResult = await this.createBucket('make-84730125-media', {
      public: false,
      file_size_limit: 52428800,
      allowed_mime_types: ['image/*', 'video/*', 'audio/*'],
    });

    if (bucketResult.success) {
      console.log('   ✅ Bucket created: make-84730125-media\n');
    } else {
      console.log(`   ⚠️  Bucket creation failed: ${bucketResult.error}\n`);
    }

    // 5. Итоги
    console.log('=' .repeat(60));
    console.log('📊 DEPLOYMENT SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Tables:  ${createdTables}/${tables.length} ✅`);
    console.log(`Storage: ${bucketResult.success ? '✅' : '⚠️'}`);
    console.log('=' .repeat(60));
    console.log('');

    if (createdTables === tables.length) {
      console.log('✅ SUCCESS! Your cabinet is ready to use!\n');
      console.log('Next steps:');
      console.log('  1. Deploy edge function: supabase functions deploy make-server-84730125');
      console.log('  2. Test your application');
      console.log('  3. Check logs in Supabase Dashboard\n');
    } else {
      console.log('⚠️  PARTIAL SUCCESS - Some manual steps required\n');
      console.log('Please:');
      console.log('  1. Open Supabase Dashboard → SQL Editor');
      console.log('  2. Copy content from: database/001_promotion_tables.sql');
      console.log('  3. Paste and run in SQL Editor');
      console.log('  4. Deploy edge function: supabase functions deploy make-server-84730125\n');
    }

    return createdTables === tables.length;
  }
}

// Main
async function main() {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Missing environment variables!\n');
    console.log('Please set:');
    console.log('  export SUPABASE_URL="https://xxx.supabase.co"');
    console.log('  export SUPABASE_SERVICE_ROLE_KEY="your-key"\n');
    console.log('Get these from: Supabase Dashboard → Settings → API\n');
    Deno.exit(1);
  }

  console.log('🎵 ARTIST CABINET DEPLOYMENT');
  console.log('━'.repeat(60));
  console.log(`Project: ${SUPABASE_URL}`);
  console.log('━'.repeat(60));
  console.log('');

  const deployer = new SupabaseDeployer({
    supabaseUrl: SUPABASE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });

  const success = await deployer.deploy();
  
  Deno.exit(success ? 0 : 1);
}

main();
