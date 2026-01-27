/**
 * SUPABASE CLIENT SINGLETON
 * Единственный экземпляр Supabase клиента для всего приложения
 * Поддерживает автоматическое переключение между local Docker и production
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from '@/config/environment';

// Приватная переменная для хранения singleton instance
let instance: SupabaseClient | undefined;

// Уникальный ключ для предотвращения конфликтов
// ВАЖНО: Используется один ключ на всё приложение для предотвращения
// ошибки "Multiple GoTrueClient instances detected"
const STORAGE_KEY = `sb-${config.projectId}-auth-token`;

// Флаг для отслеживания создания экземпляра
let instanceCreated = false;

/**
 * Получить singleton экземпляр Supabase клиента
 * Создается только при первом вызове
 */
function getSupabaseClient(): SupabaseClient {
  if (!instance) {
    if (instanceCreated) {
      console.warn('[Supabase] Warning: Attempting to create multiple instances!');
    }
    
    console.log(`[Supabase] Creating singleton client instance (${config.mode} mode)`);
    console.log(`[Supabase] URL: ${config.supabaseUrl}`);
    instanceCreated = true;
    
    instance = createClient(
      config.supabaseUrl,
      config.supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: STORAGE_KEY,
          // Отключаем debug логирование для предотвращения спама
          debug: false,
        },
      }
    );
  }
  
  return instance;
}

// Lazy getter для обратной совместимости
// Не создает клиент при импорте модуля
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

export { getSupabaseClient };