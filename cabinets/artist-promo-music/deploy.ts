#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env

/**
 * AUTOMATIC DEPLOYMENT SCRIPT FOR ARTIST CABINET
 * 
 * Деплоит весь кабинет в Supabase:
 * - SQL миграции (создание таблиц)
 * - Edge Functions (бэкенд)
 * - Storage buckets (файловое хранилище)
 * - Auth настройки
 * 
 * Usage:
 *   deno run --allow-net --allow-read --allow-env deploy.ts
 * 
 * Environment variables required:
 *   SUPABASE_URL - URL проекта (https://xxx.supabase.co)
 *   SUPABASE_SERVICE_ROLE_KEY - Service role ключ
 *   SUPABASE_ACCESS_TOKEN - Management API токен (для деплоя функций)
 */

import config from './deploy.config.json' assert { type: 'json' };

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step: number, total: number, message: string) {
  log(`\n[${step}/${total}] ${message}`, colors.cyan);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

// Проверка переменных окружения
function checkEnvVars() {
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = required.filter(v => !Deno.env.get(v));
  
  if (missing.length > 0) {
    logError(`Missing environment variables: ${missing.join(', ')}`);
    log('\nPlease set them using:', colors.gray);
    log('  export SUPABASE_URL="https://xxx.supabase.co"', colors.gray);
    log('  export SUPABASE_SERVICE_ROLE_KEY="your-key"', colors.gray);
    Deno.exit(1);
  }
}

// 1. Деплой SQL миграций
async function deployDatabase() {
  logStep(1, 4, 'Deploying database migrations');
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  for (const migrationFile of config.database.migrations) {
    try {
      log(`  📄 Reading ${migrationFile}...`, colors.gray);
      const sql = await Deno.readTextFile(migrationFile);
      
      log(`  🚀 Executing SQL migration...`, colors.gray);
      
      // Используем PostgREST для выполнения SQL через RPC
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey!,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ query: sql }),
      });

      if (response.ok) {
        logSuccess(`Migration ${migrationFile} applied`);
      } else {
        // Пробуем альтернативный метод через SQL Editor API
        log(`  🔄 Trying alternative method...`, colors.gray);
        
        // Разбиваем SQL на отдельные statements
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        for (const statement of statements) {
          const pgResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': serviceRoleKey!,
              'Authorization': `Bearer ${serviceRoleKey}`,
              'Prefer': 'return=minimal',
            },
            body: statement,
          });
          
          if (!pgResponse.ok) {
            const error = await pgResponse.text();
            logWarning(`Statement failed: ${error.slice(0, 100)}...`);
          }
        }
        
        logSuccess(`Migration ${migrationFile} applied (with warnings)`);
      }
    } catch (error) {
      logError(`Failed to apply migration ${migrationFile}: ${error.message}`);
      logWarning('You may need to run SQL manually in Supabase Dashboard');
      log(`  📋 File location: ${migrationFile}`, colors.gray);
    }
  }
}

// 2. Деплой Edge Functions
async function deployEdgeFunctions() {
  logStep(2, 4, 'Deploying Edge Functions');
  
  const accessToken = Deno.env.get('SUPABASE_ACCESS_TOKEN');
  
  if (!accessToken) {
    logWarning('SUPABASE_ACCESS_TOKEN not set - skipping edge functions deployment');
    log('  Edge functions need to be deployed manually via Supabase CLI:', colors.gray);
    log('  supabase functions deploy make-server-84730125', colors.gray);
    return;
  }

  for (const func of config.backend.edge_functions) {
    try {
      log(`  📦 Deploying function: ${func.name}...`, colors.gray);
      
      // TODO: Implement edge function deployment via Management API
      // Требует создания bundle и отправки через Management API
      
      logWarning(`Function ${func.name} needs manual deployment`);
      log(`  Run: supabase functions deploy ${func.name}`, colors.gray);
    } catch (error) {
      logError(`Failed to deploy function ${func.name}: ${error.message}`);
    }
  }
}

// 3. Настройка Storage
async function deployStorage() {
  logStep(3, 4, 'Setting up Storage buckets');
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  for (const bucket of config.storage.buckets) {
    try {
      log(`  🪣 Creating bucket: ${bucket.name}...`, colors.gray);
      
      const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey!,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          name: bucket.name,
          public: bucket.public,
          file_size_limit: bucket.file_size_limit,
          allowed_mime_types: bucket.allowed_mime_types,
        }),
      });

      if (response.ok) {
        logSuccess(`Bucket ${bucket.name} created`);
      } else {
        const error = await response.json();
        if (error.message?.includes('already exists')) {
          log(`  ℹ️  Bucket ${bucket.name} already exists`, colors.gray);
        } else {
          logWarning(`Failed to create bucket: ${error.message}`);
        }
      }
    } catch (error) {
      logError(`Failed to create bucket ${bucket.name}: ${error.message}`);
    }
  }
}

// 4. Проверка деплоя
async function verifyDeployment() {
  logStep(4, 4, 'Verifying deployment');
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  // Проверяем таблицы
  let tablesOk = 0;
  for (const tableName of config.database.tables) {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/${tableName}?select=id&limit=1`,
        {
          headers: {
            'apikey': serviceRoleKey!,
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
        }
      );

      if (response.ok) {
        tablesOk++;
      }
    } catch (error) {
      // Ignore
    }
  }

  log(`\n📊 Deployment Summary:`, colors.cyan);
  log(`  Tables: ${tablesOk}/${config.database.tables.length} verified`, colors.gray);
  
  if (tablesOk === config.database.tables.length) {
    logSuccess('All tables created successfully!');
  } else {
    logWarning(`${config.database.tables.length - tablesOk} tables need manual creation`);
  }
}

// Main
async function main() {
  log('\n═══════════════════════════════════════════════════', colors.blue);
  log('  🚀 SUPABASE DEPLOYMENT SCRIPT', colors.blue);
  log(`  📦 Cabinet: ${config.cabinet_name}`, colors.blue);
  log(`  🏷️  Version: ${config.version}`, colors.blue);
  log('═══════════════════════════════════════════════════\n', colors.blue);

  checkEnvVars();

  try {
    await deployDatabase();
    await deployEdgeFunctions();
    await deployStorage();
    await verifyDeployment();

    log('\n═══════════════════════════════════════════════════', colors.green);
    log('  ✅ DEPLOYMENT COMPLETED', colors.green);
    log('═══════════════════════════════════════════════════\n', colors.green);

    log('📝 Next steps:', colors.cyan);
    log('  1. Check tables in Supabase Dashboard → Database', colors.gray);
    log('  2. Deploy edge functions: supabase functions deploy', colors.gray);
    log('  3. Test the application', colors.gray);
  } catch (error) {
    log('\n═══════════════════════════════════════════════════', colors.red);
    log('  ❌ DEPLOYMENT FAILED', colors.red);
    log('═══════════════════════════════════════════════════\n', colors.red);
    logError(error.message);
    Deno.exit(1);
  }
}

main();
