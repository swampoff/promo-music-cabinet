#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env

/**
 * SIMPLE DEPLOYMENT SCRIPT
 * 
 * Просто выполняет SQL миграции через Supabase API
 * Это самый надежный способ для прототипирования
 * 
 * Usage:
 *   deno run --allow-net --allow-read --allow-env deploy-simple.ts
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!');
  console.log('');
  console.log('Please set:');
  console.log('  export SUPABASE_URL="https://xxx.supabase.co"');
  console.log('  export SUPABASE_SERVICE_ROLE_KEY="your-key"');
  Deno.exit(1);
}

console.log('🚀 Deploying to Supabase...\n');

// Читаем SQL миграцию
const sql = await Deno.readTextFile('database/001_promotion_tables.sql');

// Разбиваем на отдельные statements
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`📋 Found ${statements.length} SQL statements\n`);

let successCount = 0;
let errorCount = 0;

for (let i = 0; i < statements.length; i++) {
  const statement = statements[i];
  
  // Пропускаем комментарии
  if (statement.startsWith('/*') || statement.startsWith('--')) {
    continue;
  }

  try {
    // Определяем тип операции для красивого вывода
    const operation = statement.split(' ')[0].toUpperCase();
    const tableName = statement.match(/TABLE\s+(\w+)/i)?.[1] || 
                     statement.match(/POLICY\s+(\w+)/i)?.[1] ||
                     statement.match(/TRIGGER\s+(\w+)/i)?.[1] ||
                     'unknown';
    
    process.stdout.write(`[${i + 1}/${statements.length}] ${operation} ${tableName}... `);
    
    // Используем PostgREST для выполнения
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: statement + ';' }),
    });

    if (response.ok) {
      console.log('✅');
      successCount++;
    } else {
      const error = await response.text();
      
      // Проверяем, не существует ли уже объект
      if (error.includes('already exists')) {
        console.log('⏭️  (already exists)');
        successCount++;
      } else {
        console.log('❌');
        console.log(`   Error: ${error.slice(0, 100)}`);
        errorCount++;
      }
    }
  } catch (error) {
    console.log('❌');
    console.log(`   Error: ${error.message}`);
    errorCount++;
  }
}

console.log('\n' + '='.repeat(50));
console.log(`✅ Success: ${successCount}`);
console.log(`❌ Errors: ${errorCount}`);
console.log('='.repeat(50));

if (errorCount > 0) {
  console.log('\n⚠️  Some statements failed.');
  console.log('You may need to run them manually in Supabase Dashboard → SQL Editor');
  console.log('File: database/001_promotion_tables.sql');
}

console.log('\n✨ Deployment complete!');
console.log('\nNext steps:');
console.log('  1. Check tables in Dashboard → Database → Tables');
console.log('  2. Deploy edge functions: supabase functions deploy');
console.log('  3. Test your application');
