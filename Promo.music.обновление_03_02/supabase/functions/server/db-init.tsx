/**
 * DATABASE INITIALIZATION
 * 
 * Проверяет существование таблиц продвижения и показывает инструкции если нужно
 */

import { createClient } from 'npm:@supabase/supabase-js@2';

let tablesChecked = false;
let tablesExist = false;

export async function initializeDatabase() {
  // Показываем инструкции только один раз при старте
  if (tablesChecked) {
    return tablesExist;
  }

  tablesChecked = true;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Пытаемся выполнить простой SELECT из одной из таблиц
    const { data, error } = await supabase
      .from('pitching_requests')
      .select('id')
      .limit(1);

    if (error) {
      const errorMessage = error.message || '';
      const isTableNotFound = 
        errorMessage.includes('does not exist') ||
        errorMessage.includes('relation') ||
        errorMessage.includes('schema cache') ||
        error.code === '42P01' ||
        error.code === 'PGRST204';

      if (isTableNotFound) {
        // Таблицы НЕ существуют - приложение работает в режиме прототипа
        console.log('ℹ️  [DB] Tables not found - running in prototype mode');
        console.log('💡 [DB] To add real data storage, run SQL migrations from /supabase/migrations/001_promotion_tables.sql');
        
        tablesExist = false;
        return false;
      } else {
        // Другая ошибка - логируем
        console.error('❌ Database check error:', error);
        tablesExist = false;
        return false;
      }
    }

    // Таблицы существуют!
    console.log('✅ [DB] Tables ready');
    tablesExist = true;
    return true;

  } catch (error) {
    console.error('❌ Database initialization error:', error);
    tablesExist = false;
    return false;
  }
}

/**
 * Проверка существования таблиц (без вывода инструкций)
 */
export async function checkTablesExist() {
  return tablesExist;
}